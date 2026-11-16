// Relay SDP ke gateway GPT-Live: POST {baseUrl}/live/sessions dengan kunci provider suara, plus hangup.
// Kunci, SDP, dan body gateway tidak pernah dicatat ke log; pesan galat gateway tidak diteruskan ke klien.
import { createHash } from "node:crypto";
import { VOICE_MODEL_PATTERN, VOICE_NAME_PATTERN } from "../validation";
import {
  GATEWAY_SESSION_ID_PATTERN,
  SAFETY_IDENTIFIER_HEADER,
  VOICE_HANGUP_TIMEOUT_MS,
  VOICE_MESSAGES,
  VOICE_SDP_MAX_CHARS,
  VOICE_UPSTREAM_TIMEOUT_MS,
} from "./voice.constants";

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

/** Id keselamatan untuk moderasi gateway: hash sesi anonim, bukan identitas asli. */
export function hashSafetyIdentifier(sessionHash: string): string {
  return createHash("sha256").update(`jenna-voice:${sessionHash}`).digest("hex").slice(0, 32);
}

/** SDP tawaran browser: diawali `v=0`, maksimal 64 KB, diakhiri CRLF. */
export function parseOfferSdp(raw: string): Validated<string> {
  const sdp = raw.trim();
  if (sdp === "" || sdp.length > VOICE_SDP_MAX_CHARS || !sdp.startsWith("v=0")) {
    return { ok: false, error: VOICE_MESSAGES.invalidInput };
  }
  return { ok: true, value: `${sdp}\r\n` };
}

export interface LiveSessionRequest {
  baseUrl: string;
  apiKey: string;
  safetyId: string;
  sdp: string;
  model: string;
  instructions: string | null;
  /** Nama suara; kosong = suara bawaan model. */
  voice?: string | null;
  fetchImpl?: FetchLike;
}

export type LiveSessionResult =
  | { ok: true; value: { sessionId: string; sdp: string } }
  | { ok: false; status: number; error: string; invalid?: boolean; upstreamStatus?: number };

const badUpstream = (upstreamStatus?: number): LiveSessionResult => ({
  ok: false,
  status: 502,
  error: VOICE_MESSAGES.upstreamFailed,
  upstreamStatus,
});

/** Buka sesi GPT-Live dengan delegasi klien; kembalikan id sesi gateway + SDP jawaban. */
export async function openLiveSession(req: LiveSessionRequest): Promise<LiveSessionResult> {
  if (!VOICE_MODEL_PATTERN.test(req.model)) {
    return { ok: false, status: 422, error: VOICE_MESSAGES.invalidInput, invalid: true };
  }
  const session: Record<string, unknown> = { model: req.model, delegation: { type: "client" } };
  if (req.instructions) session.instructions = req.instructions;
  if (req.voice && VOICE_NAME_PATTERN.test(req.voice)) session.voice = req.voice;

  let res: Response;
  try {
    res = await (req.fetchImpl ?? fetch)(`${req.baseUrl}/live/sessions`, {
      method: "POST",
      redirect: "manual",
      headers: {
        authorization: `Bearer ${req.apiKey}`,
        accept: "application/json",
        "content-type": "application/json",
        [SAFETY_IDENTIFIER_HEADER]: req.safetyId,
      },
      body: JSON.stringify({ session, transport: { type: "webrtc", sdp: req.sdp } }),
      signal: AbortSignal.timeout(VOICE_UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return badUpstream(); // Jaringan/timeout: detail tidak diteruskan.
  }
  if (!res.ok) return badUpstream(res.status);

  const json = (await res.json().catch(() => null)) as {
    session?: { id?: unknown };
    transport?: { sdp?: unknown };
  } | null;
  const sessionId = json?.session?.id;
  const answer = json?.transport?.sdp;
  // Id gateway dipakai di path hangup; bentuk asing ditolak agar tidak bisa menyisipkan path.
  if (typeof sessionId !== "string" || !GATEWAY_SESSION_ID_PATTERN.test(sessionId) || typeof answer !== "string") {
    return badUpstream(res.status);
  }
  return { ok: true, value: { sessionId, sdp: answer } };
}

/** Putus sesi gateway. Tidak pernah melempar: status HTTP, atau -1 bila jaringan/timeout gagal. */
export async function hangupLiveSession(
  baseUrl: string,
  apiKey: string,
  gatewaySessionId: string,
  fetchImpl: FetchLike = fetch,
): Promise<number> {
  try {
    const res = await fetchImpl(`${baseUrl}/live/sessions/${encodeURIComponent(gatewaySessionId)}/hangup`, {
      method: "POST",
      redirect: "manual",
      headers: { authorization: `Bearer ${apiKey}`, accept: "application/json" },
      signal: AbortSignal.timeout(VOICE_HANGUP_TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => undefined); // Body tidak dipakai; lepas koneksi.
    return res.status;
  } catch {
    return -1; // Dicatat sebagai hangupStatus -1 oleh pemanggil; penutupan sesi lokal tetap berlaku.
  }
}
