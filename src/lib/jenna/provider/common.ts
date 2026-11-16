// Bagian bersama adapter provider (OpenAI-compatible & Anthropic) dan tes koneksi admin.
import { describeError, sanitizeErrorDetail } from "../error-detail";
import { AiProviderError } from "./types";

export interface ProviderConfig {
  /** OpenAI: berakhir `/v1`. Anthropic: dengan atau tanpa `/v1`. */
  baseUrl: string;
  apiKey: string;
  model: string;
  /** null = tidak dikirim. OpenAI: juga tidak dikirim bila reasoning effort efektif terisi. */
  temperature: number | null;
  /** null = DEFAULT_MAX_TOKENS (situs publik: biaya per jawaban harus berbatas). */
  maxTokens: number | null;
  /** OpenAI saja; setelan mentah (null = Otomatis, "off", atau nilai). Nilai efektif: `resolveReasoningEffort`. */
  reasoningEffort: string | null;
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

/** `detail` = body respons vendor (mentah; disanitasi `sealErrorDetail` saat keluar adapter). */
export function errorForStatus(status: number, detail?: string): AiProviderError {
  // 429 dan 529 (Anthropic overloaded) berarti sibuk, bukan salah konfigurasi.
  if (status === 429 || status === 529) return new AiProviderError("busy", PROVIDER_ERROR_MESSAGES.busy, status, { detail });
  if (status >= 500) return new AiProviderError("unavailable", PROVIDER_ERROR_MESSAGES.unavailable, status, { detail });
  // 401/403 (kunci), 404 (URL/model), 3xx (redirect tidak diikuti), 4xx lain.
  return new AiProviderError("config", PROVIDER_ERROR_MESSAGES.config, status, { detail });
}

export const unavailable = (cause: unknown): AiProviderError =>
  new AiProviderError("unavailable", PROVIDER_ERROR_MESSAGES.unavailable, undefined, { cause, detail: describeError(cause) });

export const badResponse = (status?: number, detail?: string): AiProviderError =>
  new AiProviderError("bad_response", PROVIDER_ERROR_MESSAGES.bad_response, status, { detail });

/** Potongan chunk stream rusak yang ikut ke pesan error format (lalu ke `detail`). */
export const BAD_CHUNK_MAX_CHARS = 300;

/** Potongan JSON respons tak terduga untuk `detail`. */
export const clipJson = (value: unknown): string => JSON.stringify(value).slice(0, 500);

const ERROR_BODY_MAX_BYTES = 4096;

/** Body respons gagal untuk `detail` (dibaca ±4 KB saja, sisanya dibatalkan). Hasilnya masih mentah. */
export async function readErrorBody(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (bytes < ERROR_BODY_MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      text += decoder.decode(value, { stream: true });
    }
  } catch (err) {
    // Body putus di tengah: status HTTP tetap dilaporkan pemanggil, alasan putusnya ikut dicatat.
    text += ` [body tidak terbaca: ${describeError(err)}]`;
  }
  // Gagal membatalkan sisa body (koneksi sudah mati) tidak mengubah error yang dilaporkan.
  await reader.cancel().catch(() => undefined);
  return text;
}

/**
 * Titik keluar tunggal adapter: `detail` disanitasi (termasuk kunci API terpasang) sebelum error
 * meninggalkan adapter, sehingga teks mentah vendor tidak pernah sampai ke log maupun DB.
 */
export function sealErrorDetail(err: unknown, apiKey: string): unknown {
  if (err instanceof AiProviderError && err.detail !== undefined) {
    err.detail = sanitizeErrorDetail(err.detail, [apiKey]);
  }
  return err;
}

export const isEventStream = (res: Response): boolean =>
  res.headers.get("content-type")?.includes("text/event-stream") ?? false;
