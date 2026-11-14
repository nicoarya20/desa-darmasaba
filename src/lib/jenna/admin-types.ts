// Kontrak API /api/developer/jenna/{stats,conversations} (viewer percakapan, role "0"). Client-safe.
// Hash sesi/IP hanya dikirim 8 karakter pertama (untuk mengenali pengunjung berulang), tidak pernah utuh.

export const JENNA_CONVERSATION_PAGE = { defaultLimit: 20, maxLimit: 50 } as const;
export const JENNA_SHORT_HASH_LENGTH = 8;
export const JENNA_PREVIEW_MAX_CHARS = 120;

export type JennaMessageRole = "user" | "assistant";
export type JennaMessageStatus = "ok" | "error";

/** data dari GET /api/developer/jenna/stats. "Hari ini" = sejak 00:00 WIB. */
export interface JennaStatsResponse {
  today: {
    /** ISO string 00:00 WIB hari ini. */
    since: string;
    /** Pesan pengunjung, termasuk giliran yang gagal. */
    userMessages: number;
    /** Jawaban Jenna yang berhasil. */
    assistantMessages: number;
    /** Giliran yang gagal (status error). */
    errorTurns: number;
    /** inputTokens + outputTokens. */
    tokensUsed: number;
  };
  /** 0 = Jenna tidak aktif di website publik. */
  dailyTokensGlobal: number;
  conversationsStored: number;
  retentionDays: number;
  generatedAt: string;
}

export interface JennaConversationSummary {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  errorCount: number;
  /** Jumlah inputTokens + outputTokens semua pesan. */
  tokens: number;
  /** Pesan pengunjung pertama (sudah dimask), maks JENNA_PREVIEW_MAX_CHARS; "" bila belum ada. */
  preview: string;
  /** 8 karakter pertama sessionHash. */
  session: string;
  /** 8 karakter pertama ipHash. */
  ip: string;
}

/** data dari GET /api/developer/jenna/conversations?page&limit&session */
export interface JennaConversationListResponse {
  items: JennaConversationSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface JennaConversationMessageDTO {
  role: JennaMessageRole;
  content: string;
  status: JennaMessageStatus;
  errorCode: string | null;
  inputTokens: number;
  outputTokens: number;
  toolsUsed: string[];
  /** Telemetri giliran (null untuk baris lama / baris user giliran sukses). */
  latencyMs: number | null;
  providerSlot: string | null;
  model: string | null;
  /** Penyebab asli giliran gagal, sudah disanitasi. */
  errorDetail: string | null;
  createdAt: string;
}

/** data dari GET /api/developer/jenna/conversations/:id */
export interface JennaConversationDetail {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  session: string;
  ip: string;
  /** Urut createdAt naik. */
  messages: JennaConversationMessageDTO[];
}

/** data dari DELETE /api/developer/jenna/conversations/:id */
export interface JennaConversationDeleteResponse {
  id: string;
}
