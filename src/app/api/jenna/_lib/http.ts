// Helper HTTP route publik /api/jenna/*: cookie sesi anonim, cek Origin, baca body ber-batas, respons gagal JSON.
import { randomBytes } from "node:crypto";
import { publicOriginFromHeaders } from "@/lib/auth-policy";
import type { JennaErrorCode, JennaFailureBody } from "@/lib/jenna/chat-types";

export const JENNA_SID_COOKIE = "jenna_sid";
export const JENNA_SID_MAX_AGE_SEC = 30 * 24 * 60 * 60;
export const JENNA_COOKIE_PATH = "/api/jenna";
const SID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function readCookie(headers: Headers, name: string): string | undefined {
  for (const part of headers.get("cookie")?.split(";") ?? []) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

/** Token sesi dari cookie; bentuk tidak valid / tidak ada → token baru (32 byte base64url). */
export function readOrCreateSessionId(headers: Headers): { sid: string; isNew: boolean } {
  const current = readCookie(headers, JENNA_SID_COOKIE);
  if (current && SID_PATTERN.test(current)) return { sid: current, isNew: false };
  return { sid: randomBytes(32).toString("base64url"), isNew: true };
}

export function sessionCookieHeader(sid: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${JENNA_SID_COOKIE}=${sid}; Path=${JENNA_COOKIE_PATH}; Max-Age=${JENNA_SID_MAX_AGE_SEC}; HttpOnly; SameSite=Lax${secure}`;
}

/** Origin wajib sama dengan origin publik (header proxy dihormati). */
export function isAllowedOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  const get = (name: string) => headers.get(name);
  if (origin === publicOriginFromHeaders(get)) return true;
  // Dev lokal tanpa proxy TLS: browser mengirim http://host, sedangkan default proto publik = https.
  const host = get("host")?.split(",")[0]?.trim();
  return process.env.NODE_ENV !== "production" && !get("x-forwarded-proto") && !!host && origin === `http://${host}`;
}

export function isJsonContentType(headers: Headers): boolean {
  return headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() === "application/json";
}

/** Body sebagai teks; null bila melebihi `maxBytes` (dicek dari Content-Length lalu saat membaca stream). */
export async function readTextCapped(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export function failureResponse(
  status: number,
  code: JennaErrorCode,
  message: string,
  opts: { retryAfterSec?: number; setCookie?: string } = {},
): Response {
  const body: JennaFailureBody = { success: false, code, message };
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (opts.retryAfterSec !== undefined) {
    body.retryAfterSec = opts.retryAfterSec;
    headers.set("retry-after", String(opts.retryAfterSec));
  }
  if (opts.setCookie) headers.append("set-cookie", opts.setCookie);
  return new Response(JSON.stringify(body), { status, headers });
}
