// GET /api/jenna/status — apakah widget Jenna publik (dan mode suaranya) boleh ditampilkan. Tanpa detail provider/kuota.
import type { JennaStatus } from "@/lib/jenna/chat-types";
import { chatAvailability, resolveActiveProvider } from "@/lib/jenna/provider/active";
import { defaultVoiceDeps } from "@/lib/jenna/voice/voice.deps";
import { isPublicVoiceEnabled } from "@/lib/jenna/voice/voice.lifecycle";
import { readOrCreateSessionId, sessionCookieHeader } from "../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Galat runtime suara (DB, tabel belum dimigrasi) tidak boleh ikut mematikan chat teks. */
async function voiceEnabledSafely(): Promise<boolean> {
  try {
    return await isPublicVoiceEnabled(defaultVoiceDeps());
  } catch (err) {
    console.error("[jenna-voice] status suara gagal", { err });
    return false;
  }
}

export async function GET(request: Request): Promise<Response> {
  const active = await resolveActiveProvider();
  const { settings } = active;
  const enabled = chatAvailability(active) === "ok";
  const body: JennaStatus = {
    enabled,
    assistantName: settings.assistantName,
    maxInputChars: settings.maxInputChars,
    voiceEnabled: enabled && (await voiceEnabledSafely()),
  };
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  const session = readOrCreateSessionId(request.headers);
  if (session.isNew) headers.append("set-cookie", sessionCookieHeader(session.sid));
  return new Response(JSON.stringify(body), { status: 200, headers });
}
