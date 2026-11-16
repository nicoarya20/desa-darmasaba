// Aturan detik suara (murni, tanpa DB). Waktu dari jam server, bukan laporan klien.
import { VOICE_STALE_AFTER_MS } from "./voice.constants";

export interface VoiceSessionRow {
  id: string;
  sessionHash: string;
  ipHash: string;
  status: string;
  gatewaySessionId: string | null;
  startedAt: Date;
  lastHeartbeatAt: Date;
  maxSeconds: number;
  endedAt: Date | null;
  endReason: string | null;
  billedSeconds: number;
}

export interface VoiceQuotaSettings {
  voiceDailyMinutesUser: number;
  voiceDailyMinutesGlobal: number;
}

export interface VoiceClose {
  endedAt: Date;
  billedSeconds: number;
  endReason: string;
}

export function isOpenSession(row: VoiceSessionRow): boolean {
  return (row.status === "starting" || row.status === "active") && row.endedAt === null;
}

/** Terbuka tetapi heartbeat terakhir sudah melewati ambang basi. */
export function isStaleSession(row: VoiceSessionRow, now: Date): boolean {
  return isOpenSession(row) && now.getTime() - row.lastHeartbeatAt.getTime() > VOICE_STALE_AFTER_MS;
}

export function elapsedSeconds(row: VoiceSessionRow, until: Date): number {
  return Math.max(0, Math.floor((until.getTime() - row.startedAt.getTime()) / 1000));
}

/** Detik tertagih bila ditutup di `until`: waktu nyata, maksimal batas sesi. */
export function billableSeconds(row: VoiceSessionRow, until: Date): number {
  return Math.min(elapsedSeconds(row, until), row.maxSeconds);
}

/** Sesi basi ditagih sampai heartbeat terakhir saja. */
export function settleStaleSession(row: VoiceSessionRow): VoiceClose {
  const endedAt = row.lastHeartbeatAt;
  return { endedAt, billedSeconds: billableSeconds(row, endedAt), endReason: "stale" };
}

/** Penutupan pada `now`: sesi basi ditagih sampai heartbeat terakhir, selain itu waktu nyata. */
export function closeAt(row: VoiceSessionRow, now: Date, endReason: string): VoiceClose {
  if (isStaleSession(row, now)) return settleStaleSession(row);
  return { endedAt: now, billedSeconds: billableSeconds(row, now), endReason };
}

/** Detik berjalan sesi terbuka (belum masuk `billedSeconds`). */
export function liveSeconds(row: VoiceSessionRow, now: Date): number {
  if (!isOpenSession(row)) return 0;
  return closeAt(row, now, "").billedSeconds;
}

export interface VoiceUsage {
  session: number;
  ip: number;
  global: number;
}

/** Sisa detik hari ini = minimum sisa kuota sesi, IP, dan global; tidak pernah negatif. */
export function remainingSeconds(settings: VoiceQuotaSettings, used: VoiceUsage): number {
  const user = settings.voiceDailyMinutesUser * 60;
  const global = settings.voiceDailyMinutesGlobal * 60;
  return Math.max(0, Math.min(user - used.session, user - used.ip, global - used.global));
}
