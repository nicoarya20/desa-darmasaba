// @vitest-environment node
// Route handler /api/jenna/voice/*: Origin, batas body, key asing, honeypot, id path, pemetaan hasil service.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  heartbeat: vi.fn(),
  close: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: { BETTER_AUTH_SECRET: "test-secret" } }));
vi.mock("@/lib/jenna/voice/voice.deps", () => ({ defaultVoiceDeps: () => ({}) }));
vi.mock("@/lib/jenna/voice/voice.service", () => ({ startVoiceSession: mocks.start }));
vi.mock("@/lib/jenna/voice/voice.lifecycle", () => ({ heartbeatVoiceSession: mocks.heartbeat, closeVoiceSession: mocks.close }));

import { POST as closePOST } from "@/app/api/jenna/voice/session/[id]/close/route";
import { POST as heartbeatPOST } from "@/app/api/jenna/voice/session/[id]/heartbeat/route";
import { POST as startPOST } from "@/app/api/jenna/voice/session/route";

const ORIGIN = "https://darmasaba.id";
const ID = "voicesession0000000001";
const SID = "a".repeat(43);

function voiceRequest(
  path: string,
  body: unknown,
  { origin = ORIGIN, contentType = "application/json", cookie }: { origin?: string | null; contentType?: string; cookie?: string } = {},
): Request {
  const h = new Headers({ host: "darmasaba.id", "x-forwarded-proto": "https", "content-type": contentType });
  if (origin) h.set("origin", origin);
  if (cookie) h.set("cookie", cookie);
  return new Request(`http://localhost/api/jenna/voice/${path}`, {
    method: "POST",
    headers: h,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const startBody = { sdp: "v=0\r\n", consent: true };

beforeEach(() => {
  mocks.start.mockReset();
  mocks.heartbeat.mockReset();
  mocks.close.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/jenna/voice/session", () => {
  it("sukses → 200 no-store, cookie sesi baru, identitas hanya hash", async () => {
    mocks.start.mockResolvedValue({
      ok: true,
      value: { sessionId: ID, sdp: "v=0 answer", maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 300 },
    });
    const res = await startPOST(voiceRequest("session", startBody));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("set-cookie")).toMatch(/^jenna_sid=/);
    expect(await res.json()).toEqual({ sessionId: ID, sdp: "v=0 answer", maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 300 });
    const [who, body] = mocks.start.mock.calls[0];
    expect(body).toEqual(startBody);
    expect(who.sessionHash).toMatch(/^[a-f0-9]+$/);
    expect(who.ipHash).toMatch(/^[a-f0-9]+$/);
  });

  it("Origin asing/tanpa Origin → 403 VOICE_FORBIDDEN_ORIGIN", async () => {
    for (const origin of ["https://evil.test", null]) {
      const res = await startPOST(voiceRequest("session", startBody, { origin }));
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ success: false, code: "VOICE_FORBIDDEN_ORIGIN" });
    }
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it.each([
    ["content-type bukan JSON", voiceRequest("session", "sdp=v=0", { contentType: "text/plain" })],
    ["body > 72 KB", voiceRequest("session", { sdp: `v=0${"a".repeat(80 * 1024)}`, consent: true })],
    ["JSON rusak", voiceRequest("session", "{sdp:")],
    ["key asing", voiceRequest("session", { ...startBody, model: "x" })],
    ["consent bukan boolean", voiceRequest("session", { sdp: "v=0", consent: "ya" })],
    ["honeypot terisi", voiceRequest("session", { ...startBody, website: "http://spam" })],
  ])("%s → 422 VOICE_INVALID_INPUT tanpa service/relay", async (_label, req) => {
    const res = await startPOST(req);
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ success: false, code: "VOICE_INVALID_INPUT" });
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it("penolakan service → status + Retry-After + body kontrak", async () => {
    mocks.start.mockResolvedValue({ ok: false, status: 429, code: "VOICE_QUOTA_EXHAUSTED", message: "habis", retryAfterSec: 99 });
    const res = await startPOST(voiceRequest("session", startBody, { cookie: `jenna_sid=${SID}` }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("99");
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(await res.json()).toEqual({ success: false, code: "VOICE_QUOTA_EXHAUSTED", message: "habis", retryAfterSec: 99 });
  });

  it("service melempar → 500 generik tanpa detail", async () => {
    mocks.start.mockRejectedValue(new Error("db down: secret"));
    const res = await startPOST(voiceRequest("session", startBody));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toMatchObject({ success: false, code: "VOICE_UPSTREAM_FAILED" });
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});

describe("POST /api/jenna/voice/session/[id]/heartbeat & close", () => {
  it("heartbeat body {} → hasil service apa adanya", async () => {
    mocks.heartbeat.mockResolvedValue({ ok: true, value: { elapsedSeconds: 15, maxSeconds: 300, remainingTodaySeconds: 285, stop: null } });
    const res = await heartbeatPOST(voiceRequest(`session/${ID}/heartbeat`, {}), params(ID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ elapsedSeconds: 15, maxSeconds: 300, remainingTodaySeconds: 285, stop: null });
    expect(mocks.heartbeat.mock.calls[0][1]).toBe(ID);
  });

  it("id path asing → 404 VOICE_SESSION_NOT_FOUND tanpa service", async () => {
    for (const id of ["../x", "short", "A".repeat(25)]) {
      const res = await heartbeatPOST(voiceRequest(`session/x/heartbeat`, {}), params(id));
      expect(res.status).toBe(404);
      expect(await res.json()).toMatchObject({ code: "VOICE_SESSION_NOT_FOUND" });
    }
    expect((await closePOST(voiceRequest("session/x/close", { reason: "user" }), params("../x"))).status).toBe(404);
    expect(mocks.heartbeat).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  it("heartbeat dengan key → 422; close alasan asing → 422; Origin asing → 403", async () => {
    expect((await heartbeatPOST(voiceRequest(`session/${ID}/heartbeat`, { elapsed: 5 }), params(ID))).status).toBe(422);
    expect((await closePOST(voiceRequest(`session/${ID}/close`, { reason: "hack" }), params(ID))).status).toBe(422);
    expect((await closePOST(voiceRequest(`session/${ID}/close`, { reason: "user" }, { origin: "https://evil.test" }), params(ID))).status).toBe(403);
    expect(mocks.close).not.toHaveBeenCalled();
  });

  it("close → billedSeconds; alasan diteruskan", async () => {
    mocks.close.mockResolvedValue({ ok: true, value: { billedSeconds: 42 } });
    const res = await closePOST(voiceRequest(`session/${ID}/close`, { reason: "pagehide" }), params(ID));
    expect(await res.json()).toEqual({ billedSeconds: 42 });
    expect(mocks.close.mock.calls[0].slice(1, 3)).toEqual([ID, "pagehide"]);
  });
});
