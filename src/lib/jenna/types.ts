// Kontrak API /api/developer/* (dipakai backend & frontend). Client-safe: tanpa import server.
// Jangan ubah bentuknya tanpa koordinasi — lihat MIND/PLAN/developer-menu-jenna-settings.md §5.

export const JENNA_CHAT_PROTOCOLS = ["openai", "anthropic"] as const;
export type JennaChatProtocol = (typeof JENNA_CHAT_PROTOCOLS)[number];

export const JENNA_SLOTS = ["chat_openai", "chat_anthropic"] as const;
export type JennaSlot = (typeof JENNA_SLOTS)[number];

export const JENNA_SLOT_PROTOCOL: Record<JennaSlot, JennaChatProtocol> = {
  chat_openai: "openai",
  chat_anthropic: "anthropic",
};

export const JENNA_PROTOCOL_SLOT: Record<JennaChatProtocol, JennaSlot> = {
  openai: "chat_openai",
  anthropic: "chat_anthropic",
};

/** Slot provider suara realtime; terpisah dari JENNA_SLOTS supaya runtime chat tidak pernah memakainya. */
export const JENNA_VOICE_SLOT = "voice" as const;
export type JennaVoiceSlot = typeof JENNA_VOICE_SLOT;

/** Batas validasi (inklusif) — sama di server & form. */
export const JENNA_SETTINGS_LIMITS = {
  assistantName: { minLength: 1, maxLength: 40 },
  personaNote: { maxLength: 1500 },
  maxInputChars: { min: 100, max: 10000 },
  historyWindow: { min: 0, max: 30 },
  rateLimitPerMinute: { min: 1, max: 120 },
  dailyMessagesUser: { min: 1, max: 10000 },
  /** 0 = chat tidak aktif */
  dailyTokensGlobal: { min: 0, max: 100_000_000 },
  retentionDays: { min: 1, max: 3650 },
  voiceDailyMinutesUser: { min: 1, max: 1440 },
  /** 0 = suara tidak aktif */
  voiceDailyMinutesGlobal: { min: 0, max: 100_000 },
  voiceSessionMaxMinutes: { min: 1, max: 120 },
  voiceIdleOffSeconds: { min: 10, max: 3600 },
  voiceName: { maxLength: 60 },
} as const;

/** `reasoning_effort` Chat Completions; hanya slot chat_openai. null = tidak dikirim (pakai `max_tokens`). */
export const JENNA_REASONING_EFFORTS = ["none", "low", "medium", "high"] as const;
export type JennaReasoningEffort = (typeof JENNA_REASONING_EFFORTS)[number];

export const JENNA_PROVIDER_LIMITS = {
  baseUrl: { maxLength: 500 },
  model: { minLength: 1, maxLength: 200 },
  temperature: { min: 0, max: 2 },
  maxTokens: { min: 1, max: 200_000 },
  timeoutMs: { min: 1000, max: 120_000 },
  apiKey: { maxLength: 500 },
} as const;

export interface JennaSettingsDTO {
  enabled: boolean;
  assistantName: string;
  personaNote: string;
  maxInputChars: number;
  historyWindow: number;
  rateLimitPerMinute: number;
  dailyMessagesUser: number;
  /** 0 = chat tidak aktif */
  dailyTokensGlobal: number;
  retentionDays: number;
  chatProtocol: JennaChatProtocol;
  /** Sakelar suara untuk website; belum dipakai runtime publik. */
  voiceEnabled: boolean;
  voiceDailyMinutesUser: number;
  /** 0 = suara tidak aktif */
  voiceDailyMinutesGlobal: number;
  voiceSessionMaxMinutes: number;
  voiceIdleOffSeconds: number;
  /** Kosong = suara bawaan penyedia. */
  voiceName: string;
  /** ISO string; null bila belum pernah disimpan (nilai default). */
  updatedAt: string | null;
}

/** API key TIDAK PERNAH dikirim — hanya hasApiKey + apiKeyHint (4 karakter terakhir). */
export interface JennaProviderDTO {
  slot: JennaSlot;
  protocol: JennaChatProtocol;
  baseUrl: string;
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  /** Selalu null untuk slot selain chat_openai. */
  reasoningEffort: JennaReasoningEffort | null;
  timeoutMs: number;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  /** baseUrl + model + API key terisi. */
  ready: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
  updatedAt: string | null;
}

/** Provider suara (gateway realtime). Arti field sama dengan JennaProviderDTO; API key tidak pernah dikirim. */
export interface JennaVoiceProviderDTO {
  slot: JennaVoiceSlot;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  hasApiKey: boolean;
  apiKeyHint: string | null;
  ready: boolean;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
  updatedAt: string | null;
}

export interface JennaUpdatedBy {
  id: string;
  name: string | null;
  email: string | null;
  /** ISO string waktu perubahan setelan umum terakhir. */
  at: string;
}

/** data dari GET /api/developer/jenna, PUT .../settings, PUT .../providers/:slot, PUT/DELETE .../voice/provider */
export interface JennaConfigResponse {
  settings: JennaSettingsDTO;
  /** Selalu berisi semua slot (urutan JENNA_SLOTS), termasuk yang belum dikonfigurasi. */
  providers: JennaProviderDTO[];
  /** Selalu ada; nilai kosong bila provider suara belum dikonfigurasi. */
  voiceProvider: JennaVoiceProviderDTO;
  /** JENNA_CREDENTIALS_KEY valid; false = API key tidak bisa disimpan/dibaca. */
  cryptoConfigured: boolean;
  updatedBy: JennaUpdatedBy | null;
}

/** Body PUT /api/developer/jenna/settings — parsial, minimal 1 field. */
export type JennaSettingsUpdateInput = Partial<Omit<JennaSettingsDTO, "updatedAt">>;

/** Body PUT /api/developer/jenna/providers/:slot. apiKey kosong/tidak dikirim = pertahankan kunci lama. */
export interface JennaProviderUpdateInput {
  baseUrl: string;
  model: string;
  temperature?: number | null;
  maxTokens?: number | null;
  /** Kosong/null = tidak dikirim. Diabaikan (disimpan null) untuk slot selain chat_openai. */
  reasoningEffort?: JennaReasoningEffort | "" | null;
  timeoutMs?: number;
  apiKey?: string;
}

/** data dari POST /api/developer/jenna/providers/:slot/test */
export interface JennaProviderTestResponse {
  ok: boolean;
  message: string;
  latencyMs: number;
  testedAt: string;
  provider: JennaProviderDTO;
}

/** Body PUT /api/developer/jenna/voice/provider. apiKey kosong/tidak dikirim = pertahankan kunci lama. */
export interface JennaVoiceProviderUpdateInput {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
  apiKey?: string;
}

/** data dari POST /api/developer/jenna/voice/provider/test */
export interface JennaVoiceProviderTestResponse {
  ok: boolean;
  message: string;
  latencyMs: number;
  testedAt: string;
  provider: JennaVoiceProviderDTO;
}

export interface ServiceStatus {
  ok: boolean;
  latencyMs: number;
  /** Pesan galat ringkas tanpa rahasia; null bila ok. */
  error: string | null;
}

/** data dari GET /api/developer/system */
export interface SystemOverviewResponse {
  version: string;
  nodeEnv: string;
  uptimeSec: number;
  database: ServiceStatus;
  minio: ServiceStatus & { bucket: string };
  /** Hanya nama env dari allowlist + status terisi; nilai TIDAK pernah dikirim. */
  env: { name: string; set: boolean }[];
  jenna: { cryptoConfigured: boolean; enabled: boolean; ready: boolean };
  /** ISO string waktu snapshot dibuat. */
  generatedAt: string;
}

/** Amplop respons seragam endpoint Elysia project ini. */
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
