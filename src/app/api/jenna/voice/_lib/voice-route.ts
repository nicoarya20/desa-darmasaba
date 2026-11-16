// Bagian bersama route /api/jenna/voice/*: Origin, body JSON ber-batas + zod strict, identitas anonim
// (sama dengan chat route), dan pemetaan VoiceResult → Response (sukses = objek apa adanya, no-store).
import type { z } from "zod";
import { getClientIp, hashJennaIdentifier } from "@/lib/jenna/limits";
import { VOICE_MESSAGES } from "@/lib/jenna/voice/voice.constants";
import type { VoiceIdentity, VoiceResult } from "@/lib/jenna/voice/voice.context";
import { VOICE_SESSION_ID_PATTERN } from "@/lib/jenna/voice/voice-types";
import {
  isAllowedOrigin,
  isJsonContentType,
  jsonResponse,
  readOrCreateSessionId,
  readTextCapped,
  sessionCookieHeader,
  voiceFailureResponse,
} from "../../_lib/http";

export type VoiceRequest<T> =
  | { ok: true; body: T; who: VoiceIdentity; setCookie?: string }
  | { ok: false; response: Response };

const invalid = () => voiceFailureResponse(422, "VOICE_INVALID_INPUT", VOICE_MESSAGES.invalidInput);

/** Origin → content-type → body ber-batas → JSON → zod. Penolakan sudah berupa Response siap kirim. */
export async function readVoiceRequest<T>(request: Request, schema: z.ZodType<T, z.ZodTypeDef, unknown>, maxBytes: number): Promise<VoiceRequest<T>> {
  if (!isAllowedOrigin(request.headers)) {
    return { ok: false, response: voiceFailureResponse(403, "VOICE_FORBIDDEN_ORIGIN", VOICE_MESSAGES.forbidden) };
  }
  if (!isJsonContentType(request.headers)) return { ok: false, response: invalid() };
  const text = await readTextCapped(request, maxBytes);
  if (text === null) return { ok: false, response: invalid() };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, response: invalid() }; // JSON rusak → 422, bukan error server.
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, response: invalid() };

  const session = readOrCreateSessionId(request.headers);
  return {
    ok: true,
    body: parsed.data,
    who: {
      sessionHash: hashJennaIdentifier(`sid:${session.sid}`),
      ipHash: hashJennaIdentifier(`ip:${getClientIp(request.headers) ?? "unknown"}`),
    },
    setCookie: session.isNew ? sessionCookieHeader(session.sid) : undefined,
  };
}

/** Id sesi dari path; bentuk asing dijawab sama dengan sesi yang tidak ada. */
export function invalidSessionIdResponse(id: string): Response | null {
  return VOICE_SESSION_ID_PATTERN.test(id)
    ? null
    : voiceFailureResponse(404, "VOICE_SESSION_NOT_FOUND", VOICE_MESSAGES.notFound);
}

export function voiceResultResponse<T>(result: VoiceResult<T>, setCookie?: string): Response {
  if (result.ok) return jsonResponse(result.value, { setCookie });
  return voiceFailureResponse(result.status, result.code, result.message, {
    retryAfterSec: result.retryAfterSec,
    setCookie,
  });
}

/** Galat tak terduga (DB dsb.): dicatat tanpa body/SDP, dijawab generik. */
export function voiceInternalError(scope: string, err: unknown, setCookie?: string): Response {
  console.error(`[jenna-voice] ${scope} gagal`, { err });
  return voiceFailureResponse(500, "VOICE_UPSTREAM_FAILED", VOICE_MESSAGES.internal, { setCookie });
}
