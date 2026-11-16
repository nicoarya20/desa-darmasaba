// Klien REST sesi suara publik. SDP lewat server; kunci gateway tidak pernah sampai ke browser.
// Pesan galat server sudah berbahasa Indonesia dan aman ditampilkan apa adanya.
import {
  VOICE_SESSION_ID_PATTERN,
  type VoiceClientEndReason,
  type VoiceCloseResponse,
  type VoiceErrorCode,
  type VoiceHeartbeatResponse,
  type VoiceSessionStartRequest,
  type VoiceSessionStartResponse,
  type VoiceStop,
} from "@/lib/jenna/voice/voice-types";

const BASE = "/api/jenna/voice/session";
export const VOICE_GENERIC_MESSAGE = "Mode suara sedang tidak bisa dipakai. Silakan coba lagi.";
export const VOICE_OFFLINE_MESSAGE = "Koneksi terputus. Periksa jaringan lalu coba lagi.";

const VOICE_ERROR_CODES: ReadonlySet<string> = new Set<VoiceErrorCode>([
  "VOICE_DISABLED",
  "VOICE_NOT_READY",
  "VOICE_CONSENT_REQUIRED",
  "VOICE_SESSION_ACTIVE",
  "VOICE_QUOTA_EXHAUSTED",
  "VOICE_SESSION_NOT_FOUND",
  "VOICE_SESSION_ENDED",
  "VOICE_UPSTREAM_FAILED",
  "VOICE_INVALID_INPUT",
  "VOICE_RATE_LIMITED",
  "VOICE_FORBIDDEN_ORIGIN",
]);
const VOICE_STOPS: ReadonlySet<unknown> = new Set<VoiceStop>(["quota", "max_duration", "ended", null]);

/** Request suara gagal; `status` null berarti jaringan putus. */
export class VoiceApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly code: VoiceErrorCode | null = null,
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = "VoiceApiError";
  }
}

type Json = Record<string, unknown>;

const asObject = (value: unknown): Json => (value && typeof value === "object" ? (value as Json) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asSeconds = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.ceil(value) : undefined;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

/** Respons gagal → `VoiceApiError` dengan pesan server (atau pesan umum bila bentuknya asing). */
export function toVoiceApiError(status: number, body: unknown, retryAfterHeader?: string | null): VoiceApiError {
  const b = asObject(body);
  const code = asString(b.code);
  const header = retryAfterHeader ? Number(retryAfterHeader) : undefined;
  return new VoiceApiError(
    asString(b.message) || VOICE_GENERIC_MESSAGE,
    status,
    code && VOICE_ERROR_CODES.has(code) ? (code as VoiceErrorCode) : null,
    asSeconds(b.retryAfterSec) ?? asSeconds(header),
  );
}

async function post(url: string, body: unknown, init: RequestInit = {}): Promise<Json> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      ...init,
    });
  } catch {
    throw new VoiceApiError(VOICE_OFFLINE_MESSAGE, null);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toVoiceApiError(res.status, data, res.headers.get("retry-after"));
  if (!data || typeof data !== "object") throw new VoiceApiError(VOICE_GENERIC_MESSAGE, res.status);
  return data as Json;
}

const malformed = (status = 200) => new VoiceApiError(VOICE_GENERIC_MESSAGE, status);

export function parseStartResponse(data: Json): VoiceSessionStartResponse {
  const { sessionId, sdp, maxSeconds, idleOffSeconds, remainingTodaySeconds } = data;
  if (typeof sessionId !== "string" || !VOICE_SESSION_ID_PATTERN.test(sessionId)) throw malformed();
  if (typeof sdp !== "string" || !sdp || !isCount(maxSeconds) || !isCount(idleOffSeconds) || !isCount(remainingTodaySeconds)) {
    throw malformed();
  }
  return { sessionId, sdp, maxSeconds, idleOffSeconds, remainingTodaySeconds };
}

export function parseHeartbeatResponse(data: Json): VoiceHeartbeatResponse {
  const { elapsedSeconds, maxSeconds, remainingTodaySeconds, stop } = data;
  if (!isCount(elapsedSeconds) || !isCount(maxSeconds) || !isCount(remainingTodaySeconds) || !VOICE_STOPS.has(stop)) {
    throw malformed();
  }
  return { elapsedSeconds, maxSeconds, remainingTodaySeconds, stop: stop as VoiceStop };
}

export async function startVoiceSession(sdp: string): Promise<VoiceSessionStartResponse> {
  const body: VoiceSessionStartRequest = { sdp, consent: true };
  return parseStartResponse(await post(BASE, body));
}

export async function heartbeatVoiceSession(id: string): Promise<VoiceHeartbeatResponse> {
  return parseHeartbeatResponse(await post(`${BASE}/${encodeURIComponent(id)}/heartbeat`, {}));
}

/** `keepalive` agar penutupan tetap terkirim saat tab ditutup / halaman disembunyikan. */
export async function closeVoiceSession(id: string, reason: VoiceClientEndReason): Promise<VoiceCloseResponse> {
  const data = await post(`${BASE}/${encodeURIComponent(id)}/close`, { reason }, { keepalive: true });
  return { billedSeconds: isCount(data.billedSeconds) ? data.billedSeconds : 0 };
}
