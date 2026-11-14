// POST /api/jenna/voice/session — mulai sesi suara: relay SDP tawaran browser ke gateway, balas SDP jawaban.
// Sukses: VoiceSessionStartResponse; gagal: { success:false, code, message, retryAfterSec? } (VoiceErrorCode).
import { z } from "zod";
import { VOICE_MESSAGES } from "@/lib/jenna/voice/voice.constants";
import { defaultVoiceDeps } from "@/lib/jenna/voice/voice.deps";
import { startVoiceSession } from "@/lib/jenna/voice/voice.service";
import { voiceFailureResponse } from "../../_lib/http";
import { readVoiceRequest, voiceInternalError, voiceResultResponse } from "../_lib/voice-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** SDP maksimal 64 KB + JSON pembungkus. */
const MAX_BODY_BYTES = 72 * 1024;

// Bentuk/ukuran SDP dan consent !== true dicek service agar kodenya spesifik (422 / 403).
const bodySchema = z
  .object({
    sdp: z.string(),
    consent: z.boolean(),
    website: z.string().max(200).optional(),
  })
  .strict();

export async function POST(request: Request): Promise<Response> {
  const req = await readVoiceRequest(request, bodySchema, MAX_BODY_BYTES);
  if (!req.ok) return req.response;
  // Honeypot: bot tidak pernah sampai ke relay (tanpa biaya gateway).
  if (req.body.website) {
    return voiceFailureResponse(422, "VOICE_INVALID_INPUT", VOICE_MESSAGES.invalidInput, { setCookie: req.setCookie });
  }
  try {
    const result = await startVoiceSession(req.who, { sdp: req.body.sdp, consent: req.body.consent }, defaultVoiceDeps());
    return voiceResultResponse(result, req.setCookie);
  } catch (err) {
    return voiceInternalError("start", err, req.setCookie);
  }
}
