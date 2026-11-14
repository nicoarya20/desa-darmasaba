// Bagian bersama runtime suara: hasil, dependensi yang bisa diganti test, gerbang ketersediaan,
// pemakaian hari ini, kepemilikan sesi, dan satu-satunya jalur penutupan (closeAndHangup).
import type { Limiter } from "@/lib/rate-limit";
import { startOfJakartaDay } from "../limits";
import type { JennaSettingsDTO } from "../types";
import { VOICE_MESSAGES } from "./voice.constants";
import { liveSeconds, remainingSeconds, type VoiceClose, type VoiceSessionRow, type VoiceUsage } from "./voice.quota";
import { hangupLiveSession, type FetchLike } from "./voice.relay";
import type { VoiceSessionRepo } from "./voice.repo";
import type { VoiceErrorCode } from "./voice-types";

export type VoiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; code: VoiceErrorCode; message: string; retryAfterSec?: number };

/** Kredensial gateway suara yang sudah tervalidasi (server-only). */
export interface VoiceProviderCreds {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface VoiceRuntime {
  settings: JennaSettingsDTO;
  /** Ketersediaan chat publik (rumus yang sama dengan /api/jenna/status). */
  chat: "ok" | "disabled" | "not_ready";
  /** null = slot suara belum siap. */
  provider: VoiceProviderCreds | null;
}

export interface VoiceDeps {
  loadRuntime: () => Promise<VoiceRuntime>;
  repo: VoiceSessionRepo;
  /** Batas mulai sesi per IP per menit. */
  startLimiter: Limiter;
  fetchImpl?: FetchLike;
  now: () => Date;
}

export interface VoiceIdentity {
  sessionHash: string;
  ipHash: string;
}

export const fail = (
  status: number,
  code: VoiceErrorCode,
  message: string,
  retryAfterSec?: number,
): Extract<VoiceResult<never>, { ok: false }> =>
  retryAfterSec === undefined ? { ok: false, status, code, message } : { ok: false, status, code, message, retryAfterSec };

export const notFound = () => fail(404, "VOICE_SESSION_NOT_FOUND", VOICE_MESSAGES.notFound);

/** Penolakan bila suara tidak bisa dipakai sekarang; null = boleh. Kuota dicek terpisah. */
export function voiceUnavailable(rt: VoiceRuntime): Extract<VoiceResult<never>, { ok: false }> | null {
  if (rt.chat === "disabled" || !rt.settings.voiceEnabled) return fail(409, "VOICE_DISABLED", VOICE_MESSAGES.disabled);
  if (rt.chat === "not_ready" || rt.settings.voiceDailyMinutesGlobal <= 0 || !rt.provider) {
    return fail(409, "VOICE_NOT_READY", VOICE_MESSAGES.notReady);
  }
  return null;
}

/**
 * Detik suara hari ini (WIB) per sesi, IP, dan global: sesi tertutup + detik berjalan sesi terbuka.
 * Tanpa `who` hanya global yang dihitung (session/ip = 0).
 */
export async function usageToday(
  repo: VoiceSessionRepo,
  now: Date,
  who?: VoiceIdentity,
  openRows?: VoiceSessionRow[],
): Promise<VoiceUsage> {
  const since = startOfJakartaDay(now);
  const [open, global, session, ip] = await Promise.all([
    openRows ?? repo.findOpenSessions({}),
    repo.sumBilledSince({}, since),
    who ? repo.sumBilledSince({ sessionHash: who.sessionHash }, since) : 0,
    who ? repo.sumBilledSince({ ipHash: who.ipHash }, since) : 0,
  ]);
  const running = (match: (row: VoiceSessionRow) => boolean) =>
    open.reduce((sum, row) => (row.startedAt >= since && match(row) ? sum + liveSeconds(row, now) : sum), 0);
  return {
    global: global + running(() => true),
    session: who ? session + running((row) => row.sessionHash === who.sessionHash) : 0,
    ip: who ? ip + running((row) => row.ipHash === who.ipHash) : 0,
  };
}

export async function remainingToday(deps: VoiceDeps, settings: JennaSettingsDTO, who: VoiceIdentity, now: Date) {
  return remainingSeconds(settings, await usageToday(deps.repo, now, who));
}

/** Sesi milik sessionHash ini; null bila tidak ada atau milik sesi lain (tidak dibedakan). */
export async function ownedSession(deps: VoiceDeps, sessionHash: string, id: string): Promise<VoiceSessionRow | null> {
  const row = await deps.repo.findSession(id);
  return row && row.sessionHash === sessionHash ? row : null;
}

/** Putus sesi gateway, simpan status hangup, dan catat (tanpa id gateway/kunci). Tidak melempar dari jaringan. */
export async function hangupGateway(
  deps: VoiceDeps,
  rt: VoiceRuntime,
  sessionId: string,
  gatewaySessionId: string,
): Promise<void> {
  if (!rt.provider) {
    // Kredensial slot suara hilang/rusak: tidak bisa memanggil gateway; sesi gateway berakhir oleh timeout-nya sendiri.
    console.warn("[jenna-voice] hangup dilewati: provider suara belum siap", { sessionId });
    return;
  }
  const status = await hangupLiveSession(rt.provider.baseUrl, rt.provider.apiKey, gatewaySessionId, deps.fetchImpl);
  await deps.repo.recordHangup(sessionId, status);
  console.info("[jenna-voice] hangup", { sessionId, status });
}

/** Satu-satunya jalur penutupan sesi. Hangup hanya oleh pemanggil yang benar-benar menutup baris. */
export async function closeAndHangup(
  deps: VoiceDeps,
  rt: VoiceRuntime,
  row: VoiceSessionRow,
  close: VoiceClose,
): Promise<boolean> {
  const closed = await deps.repo.closeSession(row.id, close);
  if (closed && row.gatewaySessionId) await hangupGateway(deps, rt, row.id, row.gatewaySessionId);
  return closed;
}
