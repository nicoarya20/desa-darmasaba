// Kontrak wire suara publik Jenna (POST /api/jenna/voice/session, …/[id]/heartbeat, …/[id]/close).
// Client-safe: tanpa import server. Sukses = objek respons di bawah apa adanya; gagal = VoiceFailureBody.

/** Klien mengirim heartbeat tiap interval ini. */
export const VOICE_HEARTBEAT_INTERVAL_MS = 15_000;

/** Bentuk `sessionId` sesi suara (cuid) di path dan di `voiceSessionId` chat. */
export const VOICE_SESSION_ID_PATTERN = /^[a-z0-9]{20,40}$/;

export type VoiceErrorCode =
  | "VOICE_DISABLED"
  | "VOICE_NOT_READY"
  | "VOICE_CONSENT_REQUIRED"
  | "VOICE_SESSION_ACTIVE"
  | "VOICE_QUOTA_EXHAUSTED"
  | "VOICE_SESSION_NOT_FOUND"
  | "VOICE_SESSION_ENDED"
  | "VOICE_UPSTREAM_FAILED"
  | "VOICE_INVALID_INPUT"
  | "VOICE_RATE_LIMITED"
  | "VOICE_FORBIDDEN_ORIGIN";

/** Alasan penutupan yang boleh dikirim klien. */
export const VOICE_CLIENT_END_REASONS = ["user", "idle", "max_duration", "quota", "error", "pagehide"] as const;
export type VoiceClientEndReason = (typeof VOICE_CLIENT_END_REASONS)[number];

/** Body POST /api/jenna/voice/session. Key lain ditolak (422). */
export interface VoiceSessionStartRequest {
  /** SDP tawaran browser. */
  sdp: string;
  /** Persetujuan mikrofon pengunjung; selain `true` → 403 VOICE_CONSENT_REQUIRED. */
  consent: true;
  /** Honeypot: selalu kosong untuk manusia. */
  website?: string;
}

export interface VoiceSessionStartResponse {
  sessionId: string;
  /** SDP jawaban dari gateway. */
  sdp: string;
  maxSeconds: number;
  idleOffSeconds: number;
  /** Sisa detik suara hari ini (minimum dari kuota sesi, IP, dan global). */
  remainingTodaySeconds: number;
}

/** Body POST …/[id]/heartbeat: objek kosong. */
export type VoiceHeartbeatRequest = Record<string, never>;

export type VoiceStop = "quota" | "max_duration" | "ended" | null;

export interface VoiceHeartbeatResponse {
  elapsedSeconds: number;
  maxSeconds: number;
  remainingTodaySeconds: number;
  /** Bukan null = server sudah menutup sesi; klien harus memutus WebRTC. */
  stop: VoiceStop;
}

/** Body POST …/[id]/close. Aman dikirim dengan `fetch(..., { keepalive: true })` saat pagehide. */
export interface VoiceCloseRequest {
  reason: VoiceClientEndReason;
}

export interface VoiceCloseResponse {
  billedSeconds: number;
}

export interface VoiceFailureBody {
  success: false;
  code: VoiceErrorCode;
  message: string;
  retryAfterSec?: number;
}
