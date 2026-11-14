// Logika murni mode suara: sisa waktu, hitung mundur lokal, mati saat hening, level mic, pesan galat.
import type { VoiceHeartbeatResponse } from "@/lib/jenna/voice/voice-types";
import { VoiceApiError } from "./voice-api";
import { VOICE_COPY } from "./voice-copy";

export type VoiceStatus = "off" | "connecting" | "ready" | "listening" | "answering";

export type VoiceBeat = Pick<VoiceHeartbeatResponse, "elapsedSeconds" | "maxSeconds" | "remainingTodaySeconds">;

export type VoiceStopCause = "idle" | "max_duration" | "quota" | "ended";

/** Sisa detik batas sesi. */
export const sessionSecondsLeft = (beat: VoiceBeat): number => Math.max(0, beat.maxSeconds - beat.elapsedSeconds);

/** Waktu habis menurut hitungan lokal (batas sesi atau jatah hari ini): saatnya minta keputusan server. */
export const isLocallyExpired = (beat: VoiceBeat): boolean =>
  sessionSecondsLeft(beat) <= 0 || beat.remainingTodaySeconds <= 0;

/** Laporan server terakhir digeser `driftSeconds` detik (hitung mundur lokal antar heartbeat). */
export function projectBeat(beat: VoiceBeat, driftSeconds: number): VoiceBeat {
  const drift = Math.max(0, Math.floor(driftSeconds));
  return {
    elapsedSeconds: beat.elapsedSeconds + drift,
    maxSeconds: beat.maxSeconds,
    remainingTodaySeconds: Math.max(0, beat.remainingTodaySeconds - drift),
  };
}

/** Mati otomatis bila hening `idleOffSeconds`; tidak saat menyambung atau Jenna sedang menjawab. */
export function isIdleTimeout(status: VoiceStatus, lastActivityMs: number, nowMs: number, idleOffSeconds: number): boolean {
  if (status === "off" || status === "connecting" || status === "answering" || idleOffSeconds <= 0) return false;
  return nowMs - lastActivityMs >= idleOffSeconds * 1000;
}

/** "m:ss". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Sisa jatah hari ini dibulatkan ke bawah per menit; di bawah 1 menit tampil detik. */
export function formatMinutesLeft(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return s >= 60 ? `${Math.floor(s / 60)} menit` : `${s} detik`;
}

/** RMS mikrofon → level 0..1 bertingkat 0,1 (store hanya diperbarui bila tingkatnya berubah). */
export function micLevelFromRms(rms: number): number {
  if (!Number.isFinite(rms) || rms <= 0) return 0;
  return Math.min(10, Math.round(rms * 50)) / 10;
}

/** Galat start atau sesi jadi kalimat untuk pengunjung. */
export function voiceErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") return VOICE_COPY.errors.micDenied;
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") return VOICE_COPY.errors.micMissing;
    if (err.name === "NotReadableError") return VOICE_COPY.errors.micBusy;
  }
  if (!(err instanceof VoiceApiError)) return VOICE_COPY.errors.failed;
  if (err.status === null) return VOICE_COPY.errors.connectionLost;
  return err.message;
}

export function voiceStopMessage(cause: VoiceStopCause): string {
  if (cause === "idle") return VOICE_COPY.ended.idle;
  if (cause === "max_duration") return VOICE_COPY.ended.maxDuration;
  if (cause === "quota") return VOICE_COPY.ended.quota;
  return VOICE_COPY.ended.closed;
}
