// Bagian bersama adapter provider (OpenAI-compatible & Anthropic) dan tes koneksi admin.
import { AiProviderError } from "./types";

export interface ProviderConfig {
  /** OpenAI: berakhir `/v1`. Anthropic: dengan atau tanpa `/v1`. */
  baseUrl: string;
  apiKey: string;
  model: string;
  /** null = tidak dikirim (model reasoning menolak temperature). */
  temperature: number | null;
  /** null = DEFAULT_MAX_TOKENS (situs publik: biaya per jawaban harus berbatas). */
  maxTokens: number | null;
  timeoutMs: number;
}

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export const DEFAULT_MAX_TOKENS = 1024;
export const ANTHROPIC_VERSION = "2023-06-01";

export const PROVIDER_ERROR_MESSAGES = {
  config: "Asisten sedang tidak dapat digunakan karena masalah konfigurasi. Silakan coba lagi nanti.",
  busy: "Asisten sedang sibuk, silakan coba lagi sebentar.",
  unavailable: "Asisten sedang tidak tersedia, silakan coba lagi nanti.",
  bad_response: "Jawaban asisten tidak dapat dibaca, silakan coba lagi.",
} as const;

/** `/v1` pada base URL Anthropic opsional: "https://api.anthropic.com" maupun ".../v1". */
export function anthropicMessagesUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  return /\/v1$/.test(base) ? `${base}/messages` : `${base}/v1/messages`;
}

export const normalizeArguments = (raw: string | null | undefined): string => (raw && raw.trim() ? raw : "{}");

/** JSON argumen → objek (untuk `tool_use.input` Anthropic). JSON rusak/non-objek = `{}`. */
export function parseArguments(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    // Argumen rusak dari riwayat dikirim kosong; executor sudah menolaknya saat dijalankan.
    return {};
  }
}

export function errorForStatus(status: number): AiProviderError {
  // 429 dan 529 (Anthropic overloaded) berarti sibuk, bukan salah konfigurasi.
  if (status === 429 || status === 529) return new AiProviderError("busy", PROVIDER_ERROR_MESSAGES.busy, status);
  if (status >= 500) return new AiProviderError("unavailable", PROVIDER_ERROR_MESSAGES.unavailable, status);
  // 401/403 (kunci), 404 (URL/model), 3xx (redirect tidak diikuti), 4xx lain.
  return new AiProviderError("config", PROVIDER_ERROR_MESSAGES.config, status);
}

export const unavailable = (cause: unknown): AiProviderError =>
  new AiProviderError("unavailable", PROVIDER_ERROR_MESSAGES.unavailable, undefined, { cause });

export const badResponse = (status?: number): AiProviderError =>
  new AiProviderError("bad_response", PROVIDER_ERROR_MESSAGES.bad_response, status);

export const isEventStream = (res: Response): boolean =>
  res.headers.get("content-type")?.includes("text/event-stream") ?? false;
