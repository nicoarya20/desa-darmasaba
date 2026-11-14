// @vitest-environment node
// Route handler /api/jenna/chat & /api/jenna/status: Origin, honeypot, batas body, key asing, cookie, SSE.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  resolve: vi.fn(),
  voice: vi.fn(),
}));

vi.mock("@/lib/env", () => ({ env: { BETTER_AUTH_SECRET: "test-secret" } }));
vi.mock("@/lib/jenna/chat/chat.service", () => ({
  CHAT_MESSAGES: { internal: "Terjadi kesalahan, silakan coba lagi." },
  prepareChatTurn: mocks.prepare,
}));
vi.mock("@/lib/jenna/chat/deps", () => ({ defaultChatDeps: () => ({}) }));
vi.mock("@/lib/prisma", () => ({ default: {} }));
vi.mock("@/lib/jenna/provider/active", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/jenna/provider/active")>()),
  resolveActiveProvider: mocks.resolve,
}));
vi.mock("@/lib/jenna/voice/voice.deps", () => ({ defaultVoiceDeps: () => ({}) }));
vi.mock("@/lib/jenna/voice/voice.lifecycle", () => ({ isPublicVoiceEnabled: mocks.voice }));

import { POST } from "@/app/api/jenna/chat/route";
import { GET } from "@/app/api/jenna/status/route";
import type { ChatHooks } from "@/lib/jenna/chat/chat.service";
import { DEFAULT_JENNA_SETTINGS } from "@/lib/jenna/mappers";

const ORIGIN = "https://darmasaba.id";
const SID = "a".repeat(43);

function chatRequest(
  body: unknown,
  { origin = ORIGIN, contentType = "application/json", cookie, headers = {} }: {
    origin?: string | null;
    contentType?: string;
    cookie?: string;
    headers?: Record<string, string>;
  } = {},
): Request {
  const h = new Headers({ host: "darmasaba.id", "x-forwarded-proto": "https", "content-type": contentType, ...headers });
  if (origin) h.set("origin", origin);
  if (cookie) h.set("cookie", cookie);
  return new Request("http://localhost/api/jenna/chat", {
    method: "POST",
    headers: h,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

type SseEvent = { event: string; data: unknown };

async function readEvents(res: Response): Promise<SseEvent[]> {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter((block) => block.startsWith("event: "))
    .map((block) => {
      const [eventLine, dataLine] = block.split("\n");
      return { event: eventLine.slice(7), data: JSON.parse(dataLine.slice(6)) };
    });
}

const okTurn = (run: (hooks: ChatHooks) => Promise<unknown>) => mocks.prepare.mockResolvedValue({ ok: true, run });

beforeEach(() => {
  mocks.prepare.mockReset();
  mocks.resolve.mockReset();
  mocks.voice.mockReset();
  mocks.voice.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/jenna/chat — sebelum stream", () => {
  it.each([
    ["tanpa Origin", null],
    ["Origin asing", "https://evil.example"],
    ["skema berbeda", "http://darmasaba.id"],
  ])("%s → 403 forbidden_origin", async (_label, origin) => {
    const res = await POST(chatRequest({ message: "hai" }, { origin }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ success: false, code: "forbidden_origin" });
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it("Origin mengikuti x-forwarded-host", async () => {
    okTurn(async () => ({ ok: true, conversationId: "c", text: "t", sources: [] }));
    const res = await POST(
      chatRequest({ message: "hai" }, { origin: "https://desa.example", headers: { "x-forwarded-host": "desa.example" } }),
    );
    expect(res.status).toBe(200);
  });

  it("dev lokal: http://host diterima tanpa x-forwarded-proto, tidak di production", async () => {
    okTurn(async () => ({ ok: true, conversationId: "c", text: "t", sources: [] }));
    const local = () => {
      const req = chatRequest({ message: "hai" }, { origin: "http://localhost:3000", headers: { host: "localhost:3000" } });
      req.headers.delete("x-forwarded-proto");
      return req;
    };
    vi.stubEnv("NODE_ENV", "development");
    expect((await POST(local())).status).toBe(200);
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(local())).status).toBe(403);
  });

  it("content-type bukan JSON → 422", async () => {
    const res = await POST(chatRequest("message=hai", { contentType: "application/x-www-form-urlencoded" }));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ code: "invalid_input" });
  });

  it("body > 8 KB → 422 tanpa diproses", async () => {
    const res = await POST(chatRequest({ message: "x".repeat(9000) }));
    expect(res.status).toBe(422);
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it.each([
    ["JSON rusak", "{message:"],
    ["key asing", { message: "hai", history: [] }],
    ["key asing di pageContext", { message: "hai", pageContext: { route: "/", title: "x", html: "<b>" } }],
    ["message bukan string", { message: 1 }],
    ["conversationId aneh", { message: "hai", conversationId: "../x" }],
    ["array", [1]],
    ["modality asing", { message: "hai", modality: "video" }],
    ["voiceSessionId aneh", { message: "hai", modality: "voice", voiceSessionId: "../x" }],
  ])("%s → 422 invalid_input", async (_label, body) => {
    const res = await POST(chatRequest(body));
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ success: false, code: "invalid_input" });
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it("penolakan service → JSON + status + Retry-After", async () => {
    mocks.prepare.mockResolvedValue({ ok: false, status: 429, code: "rate_limited", message: "pelan", retryAfterSec: 7 });
    const res = await POST(chatRequest({ message: "hai" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("7");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ success: false, code: "rate_limited", message: "pelan", retryAfterSec: 7 });
  });

  it("service melempar → 503 provider_error generik", async () => {
    mocks.prepare.mockRejectedValue(new Error("db down: secret"));
    const res = await POST(chatRequest({ message: "hai" }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toMatchObject({ code: "provider_error" });
    expect(JSON.stringify(body)).not.toContain("secret");
  });
});

describe("POST /api/jenna/chat — honeypot & cookie", () => {
  it("honeypot terisi → done yang tampak sukses, service tidak dipanggil", async () => {
    const res = await POST(chatRequest({ message: "beli obat", website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const events = await readEvents(res);
    expect(events.map((e) => e.event)).toEqual(["meta", "done"]);
    expect(events[1].data).toMatchObject({ sources: [] });
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it("honeypot kosong diperlakukan normal", async () => {
    okTurn(async () => ({ ok: true, conversationId: "c", text: "t", sources: [] }));
    await POST(chatRequest({ message: "hai", website: "" }));
    expect(mocks.prepare).toHaveBeenCalledTimes(1);
  });

  it("cookie baru: httpOnly, SameSite=Lax, path /api/jenna, 30 hari; Secure hanya production", async () => {
    mocks.prepare.mockResolvedValue({ ok: false, status: 409, code: "disabled", message: "off" });
    vi.stubEnv("NODE_ENV", "development");
    const dev = (await POST(chatRequest({ message: "hai" }))).headers.get("set-cookie") ?? "";
    expect(dev).toMatch(/^jenna_sid=[A-Za-z0-9_-]{43}; Path=\/api\/jenna; Max-Age=2592000; HttpOnly; SameSite=Lax$/);
    vi.stubEnv("NODE_ENV", "production");
    const prod = (await POST(chatRequest({ message: "hai" }))).headers.get("set-cookie") ?? "";
    expect(prod).toMatch(/; Secure$/);
  });

  it("cookie valid dipakai ulang (hanya hash yang dikirim ke service)", async () => {
    okTurn(async () => ({ ok: true, conversationId: "c", text: "t", sources: [] }));
    const res = await POST(chatRequest({ message: "hai" }, { cookie: `other=1; jenna_sid=${SID}` }));
    expect(res.headers.get("set-cookie")).toBeNull();
    const ctx = mocks.prepare.mock.calls[0][0];
    expect(ctx.sessionHash).toMatch(/^[a-f0-9]+$/);
    expect(ctx.sessionHash).not.toContain(SID);
    expect(ctx.requestId).toHaveLength(12);

    await POST(chatRequest({ message: "hai" }, { cookie: `jenna_sid=${SID}` }));
    expect(mocks.prepare.mock.calls[1][0].sessionHash).toBe(ctx.sessionHash);
  });

  it("cookie dengan format salah diganti", async () => {
    mocks.prepare.mockResolvedValue({ ok: false, status: 409, code: "disabled", message: "off" });
    const res = await POST(chatRequest({ message: "hai" }, { cookie: "jenna_sid=pendek" }));
    expect(res.headers.get("set-cookie")).toMatch(/^jenna_sid=/);
  });
});

describe("POST /api/jenna/chat — modality suara", () => {
  it("modality & voiceSessionId diteruskan ke service", async () => {
    okTurn(async () => ({ ok: true, conversationId: "c", text: "t", sources: [] }));
    const body = { message: "hai", modality: "voice", voiceSessionId: "voicesession0000000001" };
    await POST(chatRequest(body));
    expect(mocks.prepare.mock.calls[0][1]).toEqual(body);
  });
});

describe("POST /api/jenna/chat — SSE", () => {
  it("meta → status → delta → done", async () => {
    okTurn(async (hooks) => {
      hooks.onMeta?.({ conversationId: "conv-1", requestId: "r" });
      hooks.onStatus?.("Mencari…");
      hooks.onDelta?.("Hal");
      hooks.onDelta?.("o");
      return { ok: true, conversationId: "conv-1", text: "Halo", sources: [{ title: "P", url: "/p" }], usage: {}, toolsUsed: [] };
    });
    const res = await POST(chatRequest({ message: "hai", conversationId: "conv-1", pageContext: { route: "/", title: "Beranda" } }));
    expect(res.status).toBe(200);
    expect(mocks.prepare.mock.calls[0][1]).toEqual({
      message: "hai",
      conversationId: "conv-1",
      pageContext: { route: "/", title: "Beranda" },
    });
    expect(await readEvents(res)).toEqual([
      { event: "meta", data: { conversationId: "conv-1", requestId: "r" } },
      { event: "status", data: { text: "Mencari…" } },
      { event: "delta", data: { text: "Hal" } },
      { event: "delta", data: { text: "o" } },
      { event: "done", data: { conversationId: "conv-1", text: "Halo", sources: [{ title: "P", url: "/p" }] } },
    ]);
  });

  it("gagal di tengah stream → event error dengan retryAfterSec bila ada", async () => {
    okTurn(async () => ({ ok: false, status: 504, code: "timeout", message: "lama", retryAfterSec: 3 }));
    const events = await readEvents(await POST(chatRequest({ message: "hai" })));
    expect(events).toEqual([{ event: "error", data: { code: "timeout", message: "lama", retryAfterSec: 3 } }]);
  });

  it("klien memutus → signal ke service ikut abort", async () => {
    let seen: AbortSignal | undefined;
    okTurn(
      (hooks) =>
        new Promise((resolve) => {
          seen = hooks.signal;
          hooks.signal?.addEventListener("abort", () => resolve({ ok: false, status: 499, code: "provider_error", message: "x" }));
        }),
    );
    const res = await POST(chatRequest({ message: "hai" }));
    await res.body?.cancel();
    expect(seen?.aborted).toBe(true);
  });
});

describe("GET /api/jenna/status", () => {
  const statusRequest = (cookie?: string) =>
    new Request("http://localhost/api/jenna/status", { headers: cookie ? { cookie } : {} });
  const s = (over = {}) => ({ ...DEFAULT_JENNA_SETTINGS, enabled: true, dailyTokensGlobal: 1000, updatedAt: null, ...over });

  it("aktif hanya bila enabled + provider siap + budget > 0", async () => {
    mocks.resolve.mockResolvedValue({ provider: {}, settings: s({ assistantName: "Jenna", maxInputChars: 500 }) });
    const res = await GET(statusRequest());
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("set-cookie")).toMatch(/^jenna_sid=/);
    expect(await res.json()).toEqual({ enabled: true, assistantName: "Jenna", maxInputChars: 500, voiceEnabled: true });
  });

  it("voiceEnabled false bila runtime suara menolak; tidak dicek bila chat nonaktif", async () => {
    mocks.resolve.mockResolvedValue({ provider: {}, settings: s() });
    mocks.voice.mockResolvedValue(false);
    const body = await (await GET(statusRequest(`jenna_sid=${SID}`))).json();
    expect(body).toMatchObject({ enabled: true, voiceEnabled: false });

    mocks.voice.mockClear();
    mocks.resolve.mockResolvedValue({ provider: {}, settings: s({ enabled: false }) });
    expect(await (await GET(statusRequest(`jenna_sid=${SID}`))).json()).toMatchObject({ enabled: false, voiceEnabled: false });
    expect(mocks.voice).not.toHaveBeenCalled();
  });

  it("galat runtime suara → voiceEnabled false, chat teks tetap aktif, galat dicatat", async () => {
    mocks.resolve.mockResolvedValue({ provider: {}, settings: s({ assistantName: "Jenna", maxInputChars: 500 }) });
    const boom = new Error("relation JennaVoiceSession does not exist");
    mocks.voice.mockRejectedValue(boom);
    const res = await GET(statusRequest(`jenna_sid=${SID}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enabled: true, assistantName: "Jenna", maxInputChars: 500, voiceEnabled: false });
    expect(console.error).toHaveBeenCalledWith("[jenna-voice] status suara gagal", { err: boom });
  });

  it("galat resolveActiveProvider tetap dilempar", async () => {
    mocks.resolve.mockRejectedValue(new Error("db down"));
    await expect(GET(statusRequest(`jenna_sid=${SID}`))).rejects.toThrow("db down");
  });

  it.each([
    ["nonaktif", { provider: {}, settings: s({ enabled: false }) }],
    ["provider belum siap", { notReady: "not_configured", settings: s() }],
    ["budget 0", { provider: {}, settings: s({ dailyTokensGlobal: 0 }) }],
  ])("%s → enabled false", async (_label, active) => {
    mocks.resolve.mockResolvedValue(active);
    const body = await (await GET(statusRequest(`jenna_sid=${SID}`))).json();
    expect(body.enabled).toBe(false);
    expect(body.voiceEnabled).toBe(false);
    expect(Object.keys(body).sort()).toEqual(["assistantName", "enabled", "maxInputChars", "voiceEnabled"]);
  });

  it("cookie valid tidak di-set ulang", async () => {
    mocks.resolve.mockResolvedValue({ provider: {}, settings: s() });
    expect((await GET(statusRequest(`jenna_sid=${SID}`))).headers.get("set-cookie")).toBeNull();
  });
});
