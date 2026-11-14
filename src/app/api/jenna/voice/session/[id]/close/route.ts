// POST /api/jenna/voice/session/[id]/close — body `{ reason }`. Idempoten; aman dikirim dengan
// `fetch(..., { keepalive: true })` saat pagehide (body kecil, JSON, Origin same-origin).
import { z } from "zod";
import { defaultVoiceDeps } from "@/lib/jenna/voice/voice.deps";
import { closeVoiceSession } from "@/lib/jenna/voice/voice.lifecycle";
import { VOICE_CLIENT_END_REASONS } from "@/lib/jenna/voice/voice-types";
import { invalidSessionIdResponse, readVoiceRequest, voiceInternalError, voiceResultResponse } from "../../../_lib/voice-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;
const bodySchema = z.object({ reason: z.enum(VOICE_CLIENT_END_REASONS) }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const req = await readVoiceRequest(request, bodySchema, MAX_BODY_BYTES);
  if (!req.ok) return req.response;
  const { id } = await params;
  const badId = invalidSessionIdResponse(id);
  if (badId) return badId;
  try {
    return voiceResultResponse(await closeVoiceSession(req.who, id, req.body.reason, defaultVoiceDeps()), req.setCookie);
  } catch (err) {
    return voiceInternalError("close", err, req.setCookie);
  }
}
