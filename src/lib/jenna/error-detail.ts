// Penyebab asli giliran gagal untuk Developer Console (kolom JennaMessage.errorDetail). Satu-satunya
// tempat sanitasi: teks vendor/internal tidak boleh membawa kredensial atau PII, dan tidak pernah ke pengunjung.
import { maskPii } from "./pii";
import { AiProviderError } from "./provider/types";

export const ERROR_DETAIL_MAX_CHARS = 2000;
export const CREDENTIAL_MASK = "[kunci disamarkan]";

// `Bearer <token>` / `Basic <token>` di header yang ikut tercetak.
const AUTH_SCHEME = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
// `x-api-key: …`, `api_key=…`, `"apiKey":"…"`, `authorization: …` (nilai tanpa skema).
const KEY_FIELD =
  /\b(x-api-key|api[-_]?key|authorization)\b(["']?\s*[:=]\s*["']?)(?!(?:Bearer|Basic)\s|\[kunci)[^\s"',;&}\]]+/gi;
// Kunci bergaya `sk-…`, termasuk bentuk tersensor vendor (`sk-ab***yz`).
const SK_KEY = /\bsk-[A-Za-z0-9_*-]{4,}/g;

function clip(text: string): string {
  if (text.length <= ERROR_DETAIL_MAX_CHARS) return text;
  // Jangan memotong di tengah pasangan surrogate.
  const cut = text.slice(0, ERROR_DETAIL_MAX_CHARS - 1).replace(/[\uD800-\uDBFF]$/, "");
  return `${cut}…`;
}

/**
 * Spasi dirapatkan, kredensial & PII disamarkan, maks ERROR_DETAIL_MAX_CHARS. Idempoten.
 * `secrets` = nilai rahasia yang diketahui pemanggil (kunci API terpasang), disamarkan secara literal.
 */
export function sanitizeErrorDetail(raw: string, secrets: readonly string[] = []): string {
  let text = raw;
  for (const secret of secrets) {
    if (secret) text = text.split(secret).join(CREDENTIAL_MASK);
  }
  text = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(AUTH_SCHEME, `$1 ${CREDENTIAL_MASK}`)
    .replace(KEY_FIELD, `$1$2${CREDENTIAL_MASK}`)
    .replace(SK_KEY, CREDENTIAL_MASK);
  return clip(maskPii(text));
}

/** `Nama: pesan`, plus satu tingkat `cause` (alasan jaringan di balik "fetch failed"). */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = err.cause instanceof Error ? ` (cause: ${err.cause.name}: ${err.cause.message})` : "";
  return `${err.name}: ${err.message}${cause}`;
}

/** Isi `errorDetail` satu giliran gagal: status HTTP + teks vendor, atau `Nama: pesan` untuk timeout/internal. */
export function describeTurnError(err: unknown): string {
  if (!(err instanceof AiProviderError)) return sanitizeErrorDetail(describeError(err));
  const parts = [err.status === undefined ? "" : `HTTP ${err.status}`, err.detail ?? ""].filter(Boolean);
  return sanitizeErrorDetail(parts.length > 0 ? parts.join(": ") : describeError(err));
}
