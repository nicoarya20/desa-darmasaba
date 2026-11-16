// Konstanta runtime suara (server). Interval heartbeat ada di voice-types.ts karena juga dipakai klien.
import { VOICE_HEARTBEAT_INTERVAL_MS } from "./voice-types";

export const VOICE_UPSTREAM_TIMEOUT_MS = 20_000;
export const VOICE_HANGUP_TIMEOUT_MS = 5_000;
export const VOICE_SDP_MAX_CHARS = 64 * 1024;
/** Tanpa heartbeat selama 3 interval = sesi basi (tab ditutup / jaringan putus). */
export const VOICE_STALE_AFTER_MS = VOICE_HEARTBEAT_INTERVAL_MS * 3;
export const VOICE_SWEEP_INTERVAL_MS = VOICE_HEARTBEAT_INTERVAL_MS;
export const SAFETY_IDENTIFIER_HEADER = "OpenAI-Safety-Identifier";
export const VOICE_INSTRUCTIONS_MAX = 500;
/** Batas mulai sesi per IP per menit (in-memory, 1 instance). */
export const VOICE_STARTS_PER_IP_PER_MINUTE = 3;
/** Bentuk id sesi gateway yang diterima (dipakai di path hangup). */
export const GATEWAY_SESSION_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export const VOICE_MESSAGES = {
  disabled: "Mode suara Jenna sedang tidak aktif.",
  notReady: "Mode suara belum siap dipakai. Silakan gunakan chat teks.",
  consentRequired: "Setujui penggunaan mikrofon terlebih dahulu.",
  quotaExhausted: "Jatah menit suara hari ini sudah habis. Silakan coba lagi besok atau gunakan chat teks.",
  sessionActive: "Mode suara sedang aktif di tab lain. Matikan di sana dulu.",
  notFound: "Sesi suara tidak ditemukan.",
  ended: "Sesi suara sudah berakhir.",
  upstreamFailed: "Layanan suara sedang tidak bisa dihubungi. Silakan coba lagi sebentar.",
  invalidInput: "Permintaan suara tidak valid.",
  rateLimited: "Terlalu sering memulai sesi suara. Silakan coba lagi sebentar.",
  forbidden: "Permintaan ditolak.",
  internal: "Terjadi kesalahan, silakan coba lagi.",
} as const;
