// @vitest-environment node
// Relay SDP & hangup gateway GPT-Live: bentuk request, validasi SDP/id gateway, dan kegagalan tanpa bocor detail.
import { describe, expect, it, vi } from "vitest";
import type { FetchLike } from "@/lib/jenna/voice/voice.relay";
import { hangupLiveSession, hashSafetyIdentifier, openLiveSession, parseOfferSdp } from "@/lib/jenna/voice/voice.relay";

const base = { baseUrl: "https://gw.test", apiKey: "sk-secret", safetyId: "safe-1", sdp: "v=0\r\n", model: "gpt-live", instructions: "ins" };
const answer = (body: unknown, status = 200) => vi.fn<FetchLike>(async () => Response.json(body, { status }));
const ok = () => answer({ session: { id: "gw_1" }, transport: { sdp: "v=0 answer" } });

describe("parseOfferSdp", () => {
  it("trim, wajib v=0, maksimal 64 KB, diakhiri CRLF", () => {
    expect(parseOfferSdp("  v=0\r\ns=-\n ")).toEqual({ ok: true, value: "v=0\r\ns=-\r\n" });
    expect(parseOfferSdp("")).toMatchObject({ ok: false });
    expect(parseOfferSdp("o=- 1")).toMatchObject({ ok: false });
    expect(parseOfferSdp(`v=0${"a".repeat(64 * 1024)}`)).toMatchObject({ ok: false });
  });
});

describe("hashSafetyIdentifier", () => {
  it("deterministik, 32 hex, tidak memuat sessionHash", () => {
    const id = hashSafetyIdentifier("sess-a");
    expect(id).toMatch(/^[a-f0-9]{32}$/);
    expect(hashSafetyIdentifier("sess-a")).toBe(id);
    expect(hashSafetyIdentifier("sess-b")).not.toBe(id);
  });
});

describe("openLiveSession", () => {
  it("POST /live/sessions: Bearer, safety id, redirect manual, delegasi klien; voice hanya bila valid", async () => {
    const fetchImpl = ok();
    const out = await openLiveSession({ ...base, voice: "marin", fetchImpl });
    expect(out).toEqual({ ok: true, value: { sessionId: "gw_1", sdp: "v=0 answer" } });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://gw.test/live/sessions");
    expect(init).toMatchObject({ method: "POST", redirect: "manual" });
    expect(init.headers).toMatchObject({ authorization: "Bearer sk-secret", "OpenAI-Safety-Identifier": "safe-1" });
    expect(JSON.parse(String(init.body))).toEqual({
      session: { model: "gpt-live", delegation: { type: "client" }, instructions: "ins", voice: "marin" },
      transport: { type: "webrtc", sdp: "v=0\r\n" },
    });

    const noVoice = ok();
    await openLiveSession({ ...base, voice: "bad voice/../", instructions: null, fetchImpl: noVoice });
    expect(JSON.parse(String(noVoice.mock.calls[0][1].body)).session).toEqual({ model: "gpt-live", delegation: { type: "client" } });
  });

  it("model tidak valid → 422 invalid tanpa fetch", async () => {
    const fetchImpl = ok();
    expect(await openLiveSession({ ...base, model: "-x y", fetchImpl })).toMatchObject({ ok: false, status: 422, invalid: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("gateway non-2xx → 502 + upstreamStatus; pesan gateway tidak diteruskan", async () => {
    const out = await openLiveSession({ ...base, fetchImpl: answer({ error: "secret detail" }, 401) });
    expect(out).toMatchObject({ ok: false, status: 502, upstreamStatus: 401 });
    expect(JSON.stringify(out)).not.toContain("secret");
  });

  it("jaringan/timeout → 502 tanpa upstreamStatus", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ETIMEDOUT sk-secret");
    });
    const out = await openLiveSession({ ...base, fetchImpl });
    expect(out).toEqual({ ok: false, status: 502, error: expect.any(String), upstreamStatus: undefined });
    expect(JSON.stringify(out)).not.toContain("sk-secret");
  });

  it.each([
    ["id gateway dengan slash", { session: { id: "a/b" }, transport: { sdp: "v=0" } }],
    ["id gateway kosong", { session: { id: "" }, transport: { sdp: "v=0" } }],
    ["tanpa SDP jawaban", { session: { id: "gw_1" }, transport: {} }],
    ["body bukan objek", "x"],
  ])("%s → 502", async (_label, body) => {
    expect(await openLiveSession({ ...base, fetchImpl: answer(body) })).toMatchObject({ ok: false, status: 502, upstreamStatus: 200 });
  });
});

describe("hangupLiveSession", () => {
  it("POST .../{id}/hangup dengan id ter-encode; mengembalikan status HTTP", async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => new Response("ok", { status: 404 }));
    expect(await hangupLiveSession("https://gw.test", "sk-secret", "rt:abc", fetchImpl)).toBe(404);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://gw.test/live/sessions/rt%3Aabc/hangup");
    expect(init).toMatchObject({ method: "POST", redirect: "manual", headers: { authorization: "Bearer sk-secret" } });
  });

  it("jaringan gagal → -1, tidak melempar", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    await expect(hangupLiveSession("https://gw.test", "k", "gw_1", fetchImpl)).resolves.toBe(-1);
  });
});
