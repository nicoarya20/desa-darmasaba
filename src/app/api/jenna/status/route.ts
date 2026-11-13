// GET /api/jenna/status — apakah widget Jenna publik boleh ditampilkan. Tanpa detail provider/kuota.
import type { JennaStatus } from "@/lib/jenna/chat-types";
import { resolveActiveProvider } from "@/lib/jenna/provider/active";
import { readOrCreateSessionId, sessionCookieHeader } from "../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const active = await resolveActiveProvider();
  const { settings } = active;
  const body: JennaStatus = {
    enabled: settings.enabled && !("notReady" in active) && settings.dailyTokensGlobal > 0,
    assistantName: settings.assistantName,
    maxInputChars: settings.maxInputChars,
  };
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  const session = readOrCreateSessionId(request.headers);
  if (session.isNew) headers.append("set-cookie", sessionCookieHeader(session.sid));
  return new Response(JSON.stringify(body), { status: 200, headers });
}
