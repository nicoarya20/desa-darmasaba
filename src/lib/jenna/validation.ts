// Validasi input setelan Jenna — fungsi murni, pesan galat siap tampil ke admin.
import {
  JENNA_CHAT_PROTOCOLS,
  JENNA_PROVIDER_LIMITS,
  JENNA_SETTINGS_LIMITS,
  JENNA_SLOTS,
  type JennaChatProtocol,
  type JennaProviderUpdateInput,
  type JennaSettingsUpdateInput,
  type JennaSlot,
} from "./types";
import { JENNA_CONVERSATION_PAGE } from "./admin-types";
import { JENNA_ERROR_LOG_DAYS, JENNA_ERROR_LOG_PAGE, type JennaErrorLogDays } from "./usage-types";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function isJennaSlot(value: string): value is JennaSlot {
  return (JENNA_SLOTS as readonly string[]).includes(value);
}

export function isJennaChatProtocol(value: unknown): value is JennaChatProtocol {
  return typeof value === "string" && (JENNA_CHAT_PROTOCOLS as readonly string[]).includes(value);
}

/**
 * Base URL provider: https saja; http hanya untuk localhost/127.0.0.1 di luar production;
 * tanpa kredensial, query, atau fragmen. Hasil dinormalisasi tanpa trailing slash.
 */
export function validateBaseUrl(raw: string, nodeEnv: string): ValidationResult<string> {
  const trimmed = raw.trim();
  if (trimmed.length > JENNA_PROVIDER_LIMITS.baseUrl.maxLength) {
    return { ok: false, error: `Base URL maksimal ${JENNA_PROVIDER_LIMITS.baseUrl.maxLength} karakter.` };
  }
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return { ok: false, error: "Base URL tidak valid. Contoh: https://api.openai.com/v1" };
  }
  const allowHttp = nodeEnv !== "production" && LOCAL_HOSTS.has(u.hostname);
  if (u.protocol !== "https:" && !(u.protocol === "http:" && allowHttp)) {
    return {
      ok: false,
      error: "Base URL harus memakai https (http hanya untuk localhost di luar production).",
    };
  }
  if (u.username || u.password) {
    return { ok: false, error: "Base URL tidak boleh memuat username atau password." };
  }
  if (u.search || u.hash || trimmed.includes("?") || trimmed.includes("#")) {
    return { ok: false, error: "Base URL tidak boleh memuat query atau fragmen." };
  }
  return { ok: true, value: u.toString().replace(/\/+$/, "") };
}

const INT_FIELDS = [
  ["maxInputChars", "Maks. karakter input"],
  ["historyWindow", "Jendela riwayat"],
  ["rateLimitPerMinute", "Batas pesan per menit"],
  ["dailyMessagesUser", "Kuota pesan harian per user"],
  ["dailyTokensGlobal", "Kuota token harian global"],
  ["retentionDays", "Retensi (hari)"],
] as const;

function checkInt(value: unknown, label: string, min: number, max: number): string | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return `${label} harus bilangan bulat.`;
  if (value < min || value > max) return `${label} harus di antara ${min} dan ${max}.`;
  return null;
}

/** Validasi body PUT settings (parsial). Mengembalikan objek bersih hanya berisi field yang dikenal. */
export function validateSettingsInput(input: JennaSettingsUpdateInput): ValidationResult<JennaSettingsUpdateInput> {
  const out: JennaSettingsUpdateInput = {};

  if (input.enabled !== undefined) {
    if (typeof input.enabled !== "boolean") return { ok: false, error: "Status aktif harus boolean." };
    out.enabled = input.enabled;
  }
  if (input.assistantName !== undefined) {
    const name = String(input.assistantName).trim();
    const { minLength, maxLength } = JENNA_SETTINGS_LIMITS.assistantName;
    if (name.length < minLength || name.length > maxLength) {
      return { ok: false, error: `Nama asisten harus ${minLength}-${maxLength} karakter.` };
    }
    out.assistantName = name;
  }
  if (input.personaNote !== undefined) {
    const note = String(input.personaNote).trim();
    if (note.length > JENNA_SETTINGS_LIMITS.personaNote.maxLength) {
      return { ok: false, error: `Catatan persona maksimal ${JENNA_SETTINGS_LIMITS.personaNote.maxLength} karakter.` };
    }
    out.personaNote = note;
  }
  for (const [field, label] of INT_FIELDS) {
    const value = input[field];
    if (value === undefined) continue;
    const { min, max } = JENNA_SETTINGS_LIMITS[field];
    const error = checkInt(value, label, min, max);
    if (error) return { ok: false, error };
    out[field] = value;
  }
  if (input.chatProtocol !== undefined) {
    if (!isJennaChatProtocol(input.chatProtocol)) {
      return { ok: false, error: `Protokol chat harus salah satu dari: ${JENNA_CHAT_PROTOCOLS.join(", ")}.` };
    }
    out.chatProtocol = input.chatProtocol;
  }

  if (Object.keys(out).length === 0) return { ok: false, error: "Tidak ada perubahan setelan yang dikirim." };
  return { ok: true, value: out };
}

export type ProviderUpdateValue = {
  baseUrl: string;
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  timeoutMs: number;
  /** null = pertahankan kunci lama */
  apiKey: string | null;
};

/** Validasi body PUT provider. temperature/maxTokens undefined/null = tidak dikirim ke provider. */
export function validateProviderInput(
  input: JennaProviderUpdateInput,
  nodeEnv: string,
): ValidationResult<ProviderUpdateValue> {
  const baseUrl = validateBaseUrl(input.baseUrl ?? "", nodeEnv);
  if (!baseUrl.ok) return baseUrl;

  const model = (input.model ?? "").trim();
  const ml = JENNA_PROVIDER_LIMITS.model;
  if (model.length < ml.minLength || model.length > ml.maxLength) {
    return { ok: false, error: `Model wajib diisi (maks. ${ml.maxLength} karakter).` };
  }

  let temperature: number | null = null;
  if (input.temperature != null) {
    const { min, max } = JENNA_PROVIDER_LIMITS.temperature;
    if (typeof input.temperature !== "number" || !Number.isFinite(input.temperature)) {
      return { ok: false, error: "Temperature harus angka." };
    }
    if (input.temperature < min || input.temperature > max) {
      return { ok: false, error: `Temperature harus di antara ${min} dan ${max}.` };
    }
    temperature = input.temperature;
  }

  let maxTokens: number | null = null;
  if (input.maxTokens != null) {
    const { min, max } = JENNA_PROVIDER_LIMITS.maxTokens;
    const error = checkInt(input.maxTokens, "Max tokens", min, max);
    if (error) return { ok: false, error };
    maxTokens = input.maxTokens;
  }

  const timeoutMs = input.timeoutMs ?? 30000;
  const tl = JENNA_PROVIDER_LIMITS.timeoutMs;
  const timeoutError = checkInt(timeoutMs, "Timeout (ms)", tl.min, tl.max);
  if (timeoutError) return { ok: false, error: timeoutError };

  const apiKey = (input.apiKey ?? "").trim();
  if (apiKey.length > JENNA_PROVIDER_LIMITS.apiKey.maxLength) {
    return { ok: false, error: `API key maksimal ${JENNA_PROVIDER_LIMITS.apiKey.maxLength} karakter.` };
  }
  if (/\s/.test(apiKey)) return { ok: false, error: "API key tidak boleh memuat spasi." };

  return {
    ok: true,
    value: { baseUrl: baseUrl.value, model, temperature, maxTokens, timeoutMs, apiKey: apiKey || null },
  };
}

const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SESSION_PREFIX_PATTERN = /^[a-f0-9]{8}$/;
const POSITIVE_INT_PATTERN = /^[1-9]\d{0,5}$/;

const isBlank = (v: unknown) => v === undefined || v === "";

export function isJennaConversationId(value: unknown): value is string {
  return typeof value === "string" && CONVERSATION_ID_PATTERN.test(value);
}

export type ConversationListQuery = { page: number; limit: number; session: string | null };

/** Query GET conversations (nilai string dari URL). Kosong/tidak dikirim = default. */
export function parseConversationListQuery(query: Record<string, unknown> | undefined): ValidationResult<ConversationListQuery> {
  const { page: rawPage, limit: rawLimit, session: rawSession } = query ?? {};

  let page = 1;
  if (!isBlank(rawPage)) {
    if (typeof rawPage !== "string" || !POSITIVE_INT_PATTERN.test(rawPage)) {
      return { ok: false, error: "Parameter page harus bilangan bulat ≥ 1." };
    }
    page = Number(rawPage);
  }

  const { defaultLimit, maxLimit } = JENNA_CONVERSATION_PAGE;
  let limit: number = defaultLimit;
  if (!isBlank(rawLimit)) {
    if (typeof rawLimit !== "string" || !POSITIVE_INT_PATTERN.test(rawLimit) || Number(rawLimit) > maxLimit) {
      return { ok: false, error: `Parameter limit harus di antara 1 dan ${maxLimit}.` };
    }
    limit = Number(rawLimit);
  }

  let session: string | null = null;
  if (!isBlank(rawSession)) {
    if (typeof rawSession !== "string" || !SESSION_PREFIX_PATTERN.test(rawSession)) {
      return { ok: false, error: "Parameter session harus 8 karakter heksadesimal (huruf kecil)." };
    }
    session = rawSession;
  }

  return { ok: true, value: { page, limit, session } };
}

export type ErrorLogQuery = { days: JennaErrorLogDays; limit: number; cursor: string | null };

/** Query GET errors (nilai string dari URL). Kosong/tidak dikirim = default. */
export function parseErrorLogQuery(query: Record<string, unknown> | undefined): ValidationResult<ErrorLogQuery> {
  const { days: rawDays, limit: rawLimit, cursor: rawCursor } = query ?? {};

  let days: JennaErrorLogDays = 7;
  if (!isBlank(rawDays)) {
    const match = JENNA_ERROR_LOG_DAYS.find((d) => String(d) === rawDays);
    if (match === undefined) {
      return { ok: false, error: `Parameter days harus salah satu dari ${JENNA_ERROR_LOG_DAYS.join(", ")}.` };
    }
    days = match;
  }

  const { defaultLimit, maxLimit } = JENNA_ERROR_LOG_PAGE;
  let limit: number = defaultLimit;
  if (!isBlank(rawLimit)) {
    if (typeof rawLimit !== "string" || !POSITIVE_INT_PATTERN.test(rawLimit) || Number(rawLimit) > maxLimit) {
      return { ok: false, error: `Parameter limit harus di antara 1 dan ${maxLimit}.` };
    }
    limit = Number(rawLimit);
  }

  let cursor: string | null = null;
  if (!isBlank(rawCursor)) {
    // Id pesan memakai format yang sama dengan id percakapan (cuid).
    if (!isJennaConversationId(rawCursor)) return { ok: false, error: "Parameter cursor tidak valid." };
    cursor = rawCursor;
  }

  return { ok: true, value: { days, limit, cursor } };
}
