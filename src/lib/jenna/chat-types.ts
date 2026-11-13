// Kontrak wire chat publik Jenna (GET /api/jenna/status, POST /api/jenna/chat + event SSE).
// Client-safe: tanpa import server. Nama event/field adalah kontrak — jangan diubah tanpa koordinasi widget.

export interface JennaSource {
  title: string;
  url: string;
}

/** Respons GET /api/jenna/status. */
export interface JennaStatus {
  enabled: boolean;
  assistantName: string;
  maxInputChars: number;
}

export interface JennaPageContext {
  route: string;
  title: string;
}

/** Body POST /api/jenna/chat. Key lain ditolak (422). */
export interface JennaChatRequest {
  message: string;
  conversationId?: string;
  pageContext?: JennaPageContext;
  /** Honeypot: selalu kosong untuk manusia. */
  website?: string;
}

export const JENNA_ERROR_CODES = [
  "forbidden_origin",
  "disabled",
  "not_ready",
  "invalid_input",
  "rate_limited",
  "quota_exceeded",
  "busy",
  "budget_exhausted",
  "provider_error",
  "timeout",
] as const;
export type JennaErrorCode = (typeof JENNA_ERROR_CODES)[number];

/** Respons JSON kegagalan sebelum stream dibuka. */
export interface JennaFailureBody {
  success: false;
  code: JennaErrorCode;
  message: string;
  retryAfterSec?: number;
}

export interface JennaMetaEvent {
  conversationId: string;
  requestId: string;
}

export interface JennaStatusEvent {
  text: string;
}

export interface JennaDeltaEvent {
  text: string;
}

/** `text` = jawaban akhir yang sudah dijaga; klien mengganti teks hasil stream dengan ini. */
export interface JennaDone {
  conversationId: string;
  text: string;
  sources: JennaSource[];
}

export interface JennaErrorEvent {
  code: JennaErrorCode;
  message: string;
  retryAfterSec?: number;
}

/** Event SSE POST /api/jenna/chat (selain komentar `: open` / `: ping`). */
export interface JennaSseEventMap {
  meta: JennaMetaEvent;
  status: JennaStatusEvent;
  delta: JennaDeltaEvent;
  done: JennaDone;
  error: JennaErrorEvent;
}
