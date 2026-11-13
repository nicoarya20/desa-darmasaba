// POST /api/jenna/chat — satu giliran chat publik Jenna via SSE (event: meta, status, delta, done, error).
// Penolakan sebelum stream dibuka dijawab JSON { success:false, code, message, retryAfterSec? }.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { JennaDone, JennaErrorEvent, JennaMetaEvent } from "@/lib/jenna/chat-types";
import { CHAT_MESSAGES, prepareChatTurn } from "@/lib/jenna/chat/chat.service";
import { defaultChatDeps } from "@/lib/jenna/chat/deps";
import { getClientIp, hashJennaIdentifier } from "@/lib/jenna/limits";
import { createSseResponse } from "@/lib/jenna/runtime/sse";
import {
  failureResponse,
  isAllowedOrigin,
  isJsonContentType,
  readOrCreateSessionId,
  readTextCapped,
  sessionCookieHeader,
} from "../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const INVALID_BODY_MESSAGE = "Permintaan tidak valid.";
const HONEYPOT_ANSWER = "Terima kasih, pesan Anda sudah kami terima.";

// Panjang pesan dicek service (maxInputChars dari pengaturan); di sini cukup bentuknya.
const bodySchema = z
  .object({
    message: z.string(),
    conversationId: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,64}$/)
      .optional(),
    pageContext: z.object({ route: z.string().max(300), title: z.string().max(300) }).strict().optional(),
    website: z.string().max(200).optional(),
  })
  .strict();

function parseBody(text: string): z.infer<typeof bodySchema> | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null; // JSON rusak → 422, bukan error server.
  }
  const parsed = bodySchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Bot yang mengisi honeypot mendapat respons yang tampak sukses; tanpa provider, tanpa persist. */
function honeypotResponse(requestId: string, setCookie?: string): Response {
  const conversationId = randomUUID();
  const response = createSseResponse(async (send) => {
    send("meta", { conversationId, requestId } satisfies JennaMetaEvent);
    send("done", { conversationId, text: HONEYPOT_ANSWER, sources: [] } satisfies JennaDone);
  });
  if (setCookie) response.headers.append("set-cookie", setCookie);
  return response;
}

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request.headers)) {
    return failureResponse(403, "forbidden_origin", "Permintaan ditolak.");
  }
  if (!isJsonContentType(request.headers)) return failureResponse(422, "invalid_input", INVALID_BODY_MESSAGE);
  const text = await readTextCapped(request, MAX_BODY_BYTES);
  const body = text === null ? null : parseBody(text);
  if (!body) return failureResponse(422, "invalid_input", INVALID_BODY_MESSAGE);

  const session = readOrCreateSessionId(request.headers);
  const setCookie = session.isNew ? sessionCookieHeader(session.sid) : undefined;
  const requestId = randomUUID().slice(0, 12);

  if (body.website) return honeypotResponse(requestId, setCookie);

  const ctx = {
    requestId,
    sessionHash: hashJennaIdentifier(`sid:${session.sid}`),
    ipHash: hashJennaIdentifier(`ip:${getClientIp(request.headers) ?? "unknown"}`),
  };
  const deps = defaultChatDeps();

  let prepared: Awaited<ReturnType<typeof prepareChatTurn>>;
  try {
    prepared = await prepareChatTurn(
      ctx,
      { message: body.message, conversationId: body.conversationId, pageContext: body.pageContext },
      deps,
    );
  } catch (err) {
    console.error("[jenna] gerbang chat gagal", { requestId, err });
    return failureResponse(503, "provider_error", CHAT_MESSAGES.internal, { setCookie });
  }
  if (!prepared.ok) {
    return failureResponse(prepared.status, prepared.code, prepared.message, {
      retryAfterSec: prepared.retryAfterSec,
      setCookie,
    });
  }

  const turn = prepared;
  const response = createSseResponse(async (send, signal) => {
    const outcome = await turn.run({
      signal,
      onMeta: (meta) => send("meta", meta satisfies JennaMetaEvent),
      onStatus: (statusText) => send("status", { text: statusText }),
      onDelta: (delta) => send("delta", { text: delta }),
    });
    if (outcome.ok) {
      send("done", {
        conversationId: outcome.conversationId,
        text: outcome.text,
        sources: outcome.sources,
      } satisfies JennaDone);
      return;
    }
    const error: JennaErrorEvent = { code: outcome.code, message: outcome.message };
    if (outcome.retryAfterSec !== undefined) error.retryAfterSec = outcome.retryAfterSec;
    send("error", error);
  }, request.signal);
  if (setCookie) response.headers.append("set-cookie", setCookie);
  return response;
}
