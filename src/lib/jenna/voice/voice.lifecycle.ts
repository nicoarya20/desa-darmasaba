// Siklus sesi suara yang sudah berjalan: heartbeat, tutup, dan cek "masih hidup" untuk chat bermodalitas suara.
// Detik dari jam server. Semua penutupan lewat closeAndHangup (voice.context.ts).
import {
  closeAndHangup,
  notFound,
  ownedSession,
  remainingToday,
  usageToday,
  voiceUnavailable,
  type VoiceDeps,
  type VoiceIdentity,
  type VoiceResult,
} from "./voice.context";
import {
  closeAt,
  elapsedSeconds,
  isOpenSession,
  isStaleSession,
  remainingSeconds,
  settleStaleSession,
} from "./voice.quota";
import type { VoiceClientEndReason, VoiceCloseResponse, VoiceHeartbeatResponse, VoiceStop } from "./voice-types";

export async function heartbeatVoiceSession(
  who: VoiceIdentity,
  id: string,
  deps: VoiceDeps,
): Promise<VoiceResult<VoiceHeartbeatResponse>> {
  const row = await ownedSession(deps, who.sessionHash, id);
  if (!row) return notFound();
  const rt = await deps.loadRuntime();
  const now = deps.now();

  const respond = async (elapsed: number, stop: VoiceStop): Promise<VoiceResult<VoiceHeartbeatResponse>> => ({
    ok: true,
    value: {
      elapsedSeconds: elapsed,
      maxSeconds: row.maxSeconds,
      remainingTodaySeconds: await remainingToday(deps, rt.settings, who, now),
      stop,
    },
  });

  if (!isOpenSession(row)) return respond(row.billedSeconds, "ended");
  if (isStaleSession(row, now)) {
    const settled = settleStaleSession(row);
    await closeAndHangup(deps, rt, row, settled);
    return respond(settled.billedSeconds, "ended");
  }
  if (voiceUnavailable(rt)) {
    const close = closeAt(row, now, "disabled");
    await closeAndHangup(deps, rt, row, close);
    return respond(close.billedSeconds, "ended");
  }

  const elapsed = elapsedSeconds(row, now);
  const remaining = await remainingToday(deps, rt.settings, who, now);
  const stop: VoiceStop = remaining <= 0 ? "quota" : elapsed >= row.maxSeconds ? "max_duration" : null;
  if (stop) await closeAndHangup(deps, rt, row, closeAt(row, now, stop));
  else await deps.repo.touchHeartbeat(row.id, now);
  return { ok: true, value: { elapsedSeconds: elapsed, maxSeconds: row.maxSeconds, remainingTodaySeconds: remaining, stop } };
}

/** Tutup dan tagih waktu nyata (sesi basi: sampai heartbeat terakhir). Idempoten. */
export async function closeVoiceSession(
  who: VoiceIdentity,
  id: string,
  reason: VoiceClientEndReason,
  deps: VoiceDeps,
): Promise<VoiceResult<VoiceCloseResponse>> {
  const row = await ownedSession(deps, who.sessionHash, id);
  if (!row) return notFound();
  if (!isOpenSession(row)) return { ok: true, value: { billedSeconds: row.billedSeconds } };

  const rt = await deps.loadRuntime();
  const close = closeAt(row, deps.now(), reason);
  if (await closeAndHangup(deps, rt, row, close)) return { ok: true, value: { billedSeconds: close.billedSeconds } };
  // Ditutup jalur lain di sela baca & tulis: laporkan tagihan yang tersimpan.
  const fresh = await deps.repo.findSession(id);
  return { ok: true, value: { billedSeconds: fresh?.billedSeconds ?? close.billedSeconds } };
}

/** Sesi suara `id` milik `sessionHash` aktif, belum basi, dan belum lewat batas durasi. */
export async function isVoiceSessionLive(
  sessionHash: string,
  id: string,
  deps: Pick<VoiceDeps, "repo" | "now">,
): Promise<boolean> {
  const row = await deps.repo.findSession(id);
  if (!row || row.sessionHash !== sessionHash || row.status !== "active" || !isOpenSession(row)) return false;
  const now = deps.now();
  return !isStaleSession(row, now) && elapsedSeconds(row, now) < row.maxSeconds;
}

/** `voiceEnabled` untuk /api/jenna/status: suara bisa dipakai sekarang dan kuota global hari ini masih tersisa. */
export async function isPublicVoiceEnabled(deps: Pick<VoiceDeps, "loadRuntime" | "repo" | "now">): Promise<boolean> {
  const rt = await deps.loadRuntime();
  if (voiceUnavailable(rt)) return false;
  return remainingSeconds(rt.settings, await usageToday(deps.repo, deps.now())) > 0;
}
