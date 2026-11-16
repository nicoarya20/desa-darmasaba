// POST /api/jenna/voice/session/[id]/heartbeat — body `{}` tiap 15 detik. `stop` bukan null = server sudah
// menutup sesi; klien wajib memutus WebRTC. Sesi milik sesi anonim lain → 404 (tidak dibedakan).
import { z } from "zod";
import { defaultVoiceDeps } from "@/lib/jenna/voice/voice.deps";
import { heartbeatVoiceSession } from "@/lib/jenna/voice/voice.lifecycle";
import { invalidSessionIdResponse, readVoiceRequest, voiceInternalError, voiceResultResponse } from "../../../_lib/voice-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;
const bodySchema = z.object({}).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const req = await readVoiceRequest(request, bodySchema, MAX_BODY_BYTES);
  if (!req.ok) return req.response;
  const { id } = await params;
  const badId = invalidSessionIdResponse(id);
  if (badId) return badId;
  try {
    return voiceResultResponse(await heartbeatVoiceSession(req.who, id, defaultVoiceDeps()), req.setCookie);
  } catch (err) {
    return voiceInternalError("heartbeat", err, req.setCookie);
  }
}
