// @vitest-environment node
// runChatTurn dengan deps palsu: urutan gerbang & kode, kepemilikan percakapan, history, PII, persist, usage.
// Juga retensi percakapan (purge & scheduler).
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: { BETTER_AUTH_SECRET: "test-secret" } }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/prisma", () => ({ default: {} }));

import {
  BUSY_RETRY_AFTER_SEC,
  CHAT_MESSAGES,
  createConcurrencyGate,
  prepareChatTurn,
  runChatTurn,
  type ChatDeps,
  type ChatFailure,
  type ChatSuccess,
} from "@/lib/jenna/chat/chat.service";
import type { ChatRepo, HistoryMessage, MessageRow } from "@/lib/jenna/chat/conversation.repo";
import { TurnTimeoutError, type LoopOptions, type LoopResult } from "@/lib/jenna/chat/executor-loop";
import {
  isJennaRetentionSchedulerEnabled,
  JENNA_PURGE_INTERVAL_MS,
  JENNA_PURGE_JEDA_AWAL_MS,
  purgeExpiredJennaConversations,
  startJennaRetentionScheduler,
} from "@/lib/jenna/chat/retention";
import { DEFAULT_JENNA_SETTINGS } from "@/lib/jenna/mappers";
import { AiProviderError, type AIProvider } from "@/lib/jenna/provider/types";
import type { JennaSettingsDTO } from "@/lib/jenna/types";
import { createLimiter } from "@/lib/rate-limit";

const NOW = new Date("2026-11-13T05:00:00.000Z"); // 12:00 WIB
const DAY_START = new Date("2026-11-12T17:00:00.000Z");

const settings = (over: Partial<JennaSettingsDTO> = {}): JennaSettingsDTO => ({
  ...DEFAULT_JENNA_SETTINGS,
  enabled: true,
  dailyTokensGlobal: 10_000,
  historyWindow: 4,
  rateLimitPerMinute: 5,
  dailyMessagesUser: 3,
  updatedAt: null,
  ...over,
});

const provider: AIProvider = { chat: vi.fn() };

type Appended = { conversationId: string; rows: readonly MessageRow[] };

function fakeRepo(over: Partial<ChatRepo> = {}) {
  const appended: Appended[] = [];
  const repo: ChatRepo = {
    findOwnedConversation: vi.fn(async (id: string, sessionHash: string) =>
      id === "conv-mine" && sessionHash === "sess-1" ? { id } : null,
    ),
    createConversation: vi.fn(async () => "conv-new"),
    recentMessages: vi.fn(async (): Promise<HistoryMessage[]> => [
      { role: "assistant", content: "sisa awal" },
      { role: "user", content: "tanya lama" },
      { role: "assistant", content: "jawab lama" },
    ]),
    appendMessages: vi.fn(async (conversationId: string, _who, rows: readonly MessageRow[]) => {
      appended.push({ conversationId, rows });
    }),
    countUserMessagesSince: vi.fn(async () => 0),
    sumTokensSince: vi.fn(async () => 0),
    ...over,
  };
  return { repo, appended };
}

const loopResult = (over: Partial<LoopResult> = {}): LoopResult => ({
  text: "Jawaban",
  toolsUsed: [],
  iterations: 1,
  usage: { inputTokens: 100, outputTokens: 20 },
  stopReason: "end",
  toolResults: [],
  ...over,
});

function makeDeps(over: Partial<ChatDeps> = {}, s: JennaSettingsDTO = settings()) {
  const { repo, appended } = fakeRepo();
  const execute = vi.fn(async (_p: AIProvider, opts: LoopOptions) => {
    opts.onDelta?.("Jawa");
    opts.onDelta?.("ban");
    return loopResult();
  });
  const deps: ChatDeps = {
    resolveProvider: vi.fn(async () => ({ provider, settings: s, slot: "chat_openai" as const, model: "m" })),
    repo,
    limiters: { ip: createLimiter(100, 60_000), session: createLimiter(100, 60_000), global: createLimiter(60, 60_000) },
    concurrency: createConcurrencyGate(),
    getSnapshot: vi.fn(async () => "SNAPSHOT kantor (0361) 123456"),
    getRoutes: vi.fn(async () => new Set(["/", "/profil"])),
    tools: [],
    execute,
    isVoiceSessionLive: vi.fn(async () => false),
    now: () => NOW,
    ...over,
  };
  return { deps, repo, appended, execute };
}

const ctx = { requestId: "req-1", sessionHash: "sess-1", ipHash: "ip-1" };
const input = { message: "Halo Jenna" };

async function expectFailure(deps: ChatDeps, msg: Parameters<typeof runChatTurn>[1] = input): Promise<ChatFailure> {
  const out = await runChatTurn(ctx, msg, {}, deps);
  expect(out.ok).toBe(false);
  return out as ChatFailure;
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("gerbang runChatTurn", () => {
  it("1a. nonaktif → 409 disabled (sebelum validasi input)", async () => {
    const { deps, execute } = makeDeps({}, settings({ enabled: false }));
    expect(await expectFailure(deps, { message: "" })).toMatchObject({ status: 409, code: "disabled" });
    expect(execute).not.toHaveBeenCalled();
  });

  it("1b. provider belum siap → 409 not_ready", async () => {
    const { deps } = makeDeps({
      resolveProvider: async () => ({ notReady: "not_configured", settings: settings() }),
    });
    expect(await expectFailure(deps)).toMatchObject({ status: 409, code: "not_ready" });
  });

  it("1c. dailyTokensGlobal 0 → 409 not_ready", async () => {
    const { deps } = makeDeps({}, settings({ dailyTokensGlobal: 0 }));
    expect(await expectFailure(deps)).toMatchObject({ status: 409, code: "not_ready" });
  });

  it("2. input kosong / terlalu panjang → 422 invalid_input (sebelum konkurensi & limiter)", async () => {
    const { deps } = makeDeps({}, settings({ maxInputChars: 100 }));
    const check = vi.spyOn(deps.limiters.ip, "check");
    expect(await expectFailure(deps, { message: "   " })).toMatchObject({ status: 422, code: "invalid_input" });
    expect(await expectFailure(deps, { message: "x".repeat(101) })).toMatchObject({ status: 422, code: "invalid_input" });
    expect(check).not.toHaveBeenCalled();
  });

  it("3. giliran aktif di sesi yang sama → 429 busy; slot dilepas setelah selesai", async () => {
    const { deps } = makeDeps();
    const first = await prepareChatTurn(ctx, input, deps);
    expect(first.ok).toBe(true);
    expect(await expectFailure(deps)).toMatchObject({ status: 429, code: "busy", retryAfterSec: BUSY_RETRY_AFTER_SEC });
    if (first.ok) await first.run();
    expect((await runChatTurn(ctx, input, {}, deps)).ok).toBe(true);
  });

  it("3b. penolakan gerbang berikutnya melepas slot konkurensi", async () => {
    const { deps } = makeDeps({}, settings({ dailyMessagesUser: 1 }));
    deps.repo.countUserMessagesSince = vi.fn(async () => 1);
    expect((await expectFailure(deps)).code).toBe("quota_exceeded");
    expect((await expectFailure(deps)).code).toBe("quota_exceeded");
  });

  it("4. per menit (IP → sesi → global) → 429 rate_limited + retryAfterSec", async () => {
    const { deps } = makeDeps({}, settings({ rateLimitPerMinute: 2 }));
    expect((await runChatTurn(ctx, input, {}, deps)).ok).toBe(true);
    expect((await runChatTurn({ ...ctx, sessionHash: "sess-2" }, input, {}, deps)).ok).toBe(true);
    const ipHit = await expectFailure({ ...deps }, input);
    expect(ipHit).toMatchObject({ status: 429, code: "rate_limited", message: CHAT_MESSAGES.rate_limited });
    expect(ipHit.retryAfterSec).toBeGreaterThanOrEqual(1);

    const global = makeDeps({ limiters: { ...deps.limiters, global: createLimiter(0, 60_000) } });
    const out = await runChatTurn({ ...ctx, ipHash: "ip-x", sessionHash: "sess-x" }, input, {}, global.deps);
    expect(out).toMatchObject({ ok: false, code: "rate_limited", message: CHAT_MESSAGES.global_rate_limited });
  });

  it("5. kuota harian per sesi ATAU per IP (sejak 00:00 WIB) → 429 quota_exceeded", async () => {
    const byIp = vi.fn(async (where: { sessionHash: string } | { ipHash: string }) => ("ipHash" in where ? 3 : 0));
    const { deps } = makeDeps();
    deps.repo.countUserMessagesSince = byIp;
    const out = await expectFailure(deps);
    expect(out).toMatchObject({ status: 429, code: "quota_exceeded", retryAfterSec: 12 * 3600 });
    expect(byIp).toHaveBeenCalledWith({ sessionHash: "sess-1" }, DAY_START);
    expect(byIp).toHaveBeenCalledWith({ ipHash: "ip-1" }, DAY_START);
  });

  it("6. budget token global habis → 503 budget_exhausted dengan pesan baku", async () => {
    const { deps, execute } = makeDeps();
    deps.repo.sumTokensSince = vi.fn(async () => 10_000);
    expect(await expectFailure(deps)).toMatchObject({
      status: 503,
      code: "budget_exhausted",
      message: CHAT_MESSAGES.budget_exhausted,
    });
    expect(CHAT_MESSAGES.budget_exhausted).toContain("Jenna sedang istirahat, silakan coba lagi besok atau hubungi kantor desa");
    expect(deps.repo.sumTokensSince).toHaveBeenCalledWith(DAY_START);
    expect(execute).not.toHaveBeenCalled();
  });
});

describe("modality suara", () => {
  const voiceInput = { ...input, modality: "voice" as const, voiceSessionId: "voicesession0000000001" };

  it("voice tanpa voiceSessionId → 409 voice_session_ended (setelah gerbang 1, sebelum validasi input)", async () => {
    const { deps, execute } = makeDeps();
    const out = await expectFailure(deps, { message: "", modality: "voice" });
    expect(out).toMatchObject({ status: 409, code: "voice_session_ended", message: CHAT_MESSAGES.voice_session_ended });
    expect(deps.isVoiceSessionLive).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it("voice dengan sesi suara yang tidak hidup → 409; chat nonaktif tetap 409 disabled lebih dulu", async () => {
    const { deps } = makeDeps();
    expect(await expectFailure(deps, voiceInput)).toMatchObject({ status: 409, code: "voice_session_ended" });
    expect(deps.isVoiceSessionLive).toHaveBeenCalledWith("sess-1", "voicesession0000000001");

    const off = makeDeps({}, settings({ enabled: false }));
    expect(await expectFailure(off.deps, voiceInput)).toMatchObject({ status: 409, code: "disabled" });
    expect(off.deps.isVoiceSessionLive).not.toHaveBeenCalled();
  });

  it("voice dengan sesi hidup → prompt aturan suara, modality tersimpan di baris user & asisten", async () => {
    const { deps, appended, execute } = makeDeps({ isVoiceSessionLive: vi.fn(async () => true) });
    expect((await runChatTurn(ctx, voiceInput, {}, deps)).ok).toBe(true);
    expect(execute.mock.calls[0][1].messages[0].content).toContain("ATURAN JAWABAN (SUARA");
    expect(appended[0].rows.map((r) => r.modality)).toEqual(["voice", "voice"]);
  });

  it("teks (default) → modality text, giliran gagal juga menyimpan modality", async () => {
    const ok = makeDeps();
    expect((await runChatTurn(ctx, input, {}, ok.deps)).ok).toBe(true);
    expect(ok.execute.mock.calls[0][1].messages[0].content).not.toContain("(SUARA");
    expect(ok.appended[0].rows.map((r) => r.modality)).toEqual(["text", "text"]);

    const failed = makeDeps({
      isVoiceSessionLive: vi.fn(async () => true),
      execute: vi.fn(async () => {
        throw new AiProviderError("unavailable", "down");
      }),
    });
    expect((await runChatTurn(ctx, voiceInput, {}, failed.deps)).ok).toBe(false);
    expect(failed.appended[0].rows).toEqual([expect.objectContaining({ status: "error", modality: "voice" })]);
  });
});

describe("giliran sukses", () => {
  it("percakapan bukan milik sesi → percakapan baru tanpa history", async () => {
    const { deps, repo, execute } = makeDeps();
    const meta = vi.fn();
    const out = (await runChatTurn(ctx, { ...input, conversationId: "conv-orang-lain" }, { onMeta: meta }, deps)) as ChatSuccess;
    expect(out.conversationId).toBe("conv-new");
    expect(meta).toHaveBeenCalledWith({ conversationId: "conv-new", requestId: "req-1" });
    expect(repo.recentMessages).not.toHaveBeenCalled();
    expect(execute.mock.calls[0][1].messages.map((m) => m.role)).toEqual(["system", "user"]);
  });

  it("percakapan milik sendiri → history DB (historyWindow, mulai dari user)", async () => {
    const { deps, repo, execute } = makeDeps();
    const out = (await runChatTurn(ctx, { ...input, conversationId: "conv-mine" }, {}, deps)) as ChatSuccess;
    expect(out.conversationId).toBe("conv-mine");
    expect(repo.recentMessages).toHaveBeenCalledWith("conv-mine", 4);
    expect(repo.createConversation).not.toHaveBeenCalled();
    expect(execute.mock.calls[0][1].messages.slice(1)).toEqual([
      { role: "user", content: "tanya lama" },
      { role: "assistant", content: "jawab lama" },
      { role: "user", content: "Halo Jenna" },
    ]);
  });

  it("PII pesan user dimask sebelum provider dan sebelum persist", async () => {
    const { deps, execute, appended } = makeDeps();
    await runChatTurn(ctx, { message: "NIK 3171012345678901 hp 081234567890" }, {}, deps);
    const sent = execute.mock.calls[0][1].messages.at(-1)?.content;
    expect(sent).toBe("NIK [NIK disamarkan] hp [nomor disamarkan]");
    expect(appended[0].rows[0]).toMatchObject({ role: "user", content: sent, status: "ok" });
  });

  it("jawaban dijaga, disimpan dengan token & toolsUsed; delta & status diteruskan", async () => {
    const { deps, appended } = makeDeps({
      tools: [{ spec: { name: "cari_konten", description: "", parameters: {} }, run: vi.fn() }],
      execute: vi.fn(async (_p, opts: LoopOptions) => {
        opts.onToolCall?.("cari_konten");
        opts.onDelta?.("x\n");
        return loopResult({
          text: "Kantor (0361) 123456, Pak X 081299998888. <b>[Profil](/profil)</b> [luar](https://evil.example)",
          toolsUsed: ["cari_konten"],
          usage: { inputTokens: 300, outputTokens: 40 },
        });
      }),
    });
    const status = vi.fn();
    const delta = vi.fn();
    const out = (await runChatTurn(ctx, input, { onStatus: status, onDelta: delta }, deps)) as ChatSuccess;
    expect(out.text).toBe("Kantor (0361) 123456, Pak X [nomor disamarkan]. [Profil](/profil) luar");
    expect(out.sources).toEqual([{ title: "Profil", url: "/profil" }]);
    expect(out.usage).toEqual({ inputTokens: 300, outputTokens: 40 });
    expect(status).toHaveBeenCalledWith("Mencari informasi di website desa…");
    expect(delta).toHaveBeenCalledWith("x\n");
    expect(appended[0].rows[1]).toEqual({
      role: "assistant",
      content: out.text,
      status: "ok",
      inputTokens: 300,
      outputTokens: 40,
      toolsUsed: ["cari_konten"],
      latencyMs: 0,
      providerSlot: "chat_openai",
      model: "m",
      modality: "text",
    });
  });

  it("pageContext hanya dipakai bila route terlihat", async () => {
    const { deps, execute } = makeDeps();
    await runChatTurn(ctx, { ...input, pageContext: { route: "/profil", title: "Profil Desa" } }, {}, deps);
    await runChatTurn(ctx, { ...input, pageContext: { route: "/admin/rahasia", title: "Admin" } }, {}, deps);
    expect(execute.mock.calls[0][1].messages[0].content).toContain("/profil");
    expect(execute.mock.calls[1][1].messages[0].content).not.toContain("/admin/rahasia");
  });

  it("delta stream dijaga: kontak snapshot & hasil tool lolos, nomor lain disamarkan, ekor ditahan", async () => {
    const { deps } = makeDeps({
      execute: vi.fn(async (_p, opts: LoopOptions) => {
        opts.onDelta?.("Kantor (0361) 12");
        opts.onDelta?.("3456. Pak X 0812999");
        opts.onDelta?.("98888. ");
        opts.onToolResult?.("[DATA cari_konten]\nKadus 081311112222\n[/DATA]");
        opts.onDelta?.("Kadus 081311112222.\nekor");
        return loopResult();
      }),
    });
    const deltas: string[] = [];
    await runChatTurn(ctx, input, { onDelta: (t) => deltas.push(t) }, deps);
    expect(deltas.join("")).toBe("Kantor (0361) 123456. Pak X [nomor disamarkan]. Kadus 081311112222.\n");
  });

  it("jawaban kosong setelah guard → pesan pengganti", async () => {
    const { deps } = makeDeps({ execute: vi.fn(async () => loopResult({ text: "<p></p>" })) });
    expect(((await runChatTurn(ctx, input, {}, deps)) as ChatSuccess).text).toBe(CHAT_MESSAGES.empty_answer);
  });
});

describe("giliran gagal", () => {
  it("error provider → 503 provider_error, user tersimpan status error + usage parsial, tanpa detail provider", async () => {
    const { deps, appended } = makeDeps({
      execute: vi.fn(async (_p, opts: LoopOptions) => {
        opts.onUsage?.({ inputTokens: 50, outputTokens: 5 });
        opts.onUsage?.({ inputTokens: 60, outputTokens: 0 });
        throw new AiProviderError("unavailable", "upstream 502 body=secret", 502);
      }),
    });
    const out = await expectFailure(deps);
    expect(out).toMatchObject({ status: 503, code: "provider_error", message: CHAT_MESSAGES.provider_unavailable });
    expect(out.message).not.toContain("secret");
    expect(appended).toEqual([
      {
        conversationId: "conv-new",
        rows: [
          {
            role: "user",
            content: "Halo Jenna",
            status: "error",
            errorCode: "provider_unavailable",
            errorDetail: "HTTP 502",
            inputTokens: 110,
            outputTokens: 5,
            toolsUsed: [],
            latencyMs: 0,
            providerSlot: "chat_openai",
            model: "m",
            modality: "text",
          },
        ],
      },
    ]);
  });

  it("timeout giliran → kode timeout", async () => {
    const { deps, appended } = makeDeps({ execute: vi.fn(async () => Promise.reject(new TurnTimeoutError())) });
    expect(await expectFailure(deps)).toMatchObject({ status: 504, code: "timeout" });
    expect(appended[0].rows[0]).toMatchObject({ status: "error", errorCode: "timeout" });
  });

  it("klien menutup koneksi → tercatat client_closed tanpa log error", async () => {
    const ctrl = new AbortController();
    const { deps, appended } = makeDeps({
      execute: vi.fn(async () => {
        ctrl.abort();
        throw new Error("aborted");
      }),
    });
    const out = await runChatTurn(ctx, input, { signal: ctrl.signal }, deps);
    expect(out.ok).toBe(false);
    expect(appended[0].rows[0]).toMatchObject({ errorCode: "client_closed" });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("gagal sebelum percakapan dibuat → tidak ada persist; slot dilepas", async () => {
    const { deps, appended } = makeDeps({ getRoutes: vi.fn(async () => Promise.reject(new Error("db down"))) });
    expect(await expectFailure(deps)).toMatchObject({ status: 500, code: "provider_error" });
    expect(appended).toHaveLength(0);
    deps.getRoutes = vi.fn(async () => new Set(["/"]));
    expect((await runChatTurn(ctx, input, {}, deps)).ok).toBe(true);
  });
});

describe("telemetri giliran", () => {
  // Jam hanya maju saat provider "bekerja", sehingga latencyMs = lama giliran sampai disimpan.
  function timedDeps(run: () => LoopResult) {
    let t = NOW.getTime();
    return makeDeps({
      now: () => new Date(t),
      resolveProvider: vi.fn(async () => ({ provider, settings: settings(), slot: "chat_anthropic" as const, model: "claude-x" })),
      execute: vi.fn(async () => {
        t += 1234;
        return run();
      }),
    });
  }
  const TELEMETRY = { latencyMs: 1234, providerSlot: "chat_anthropic", model: "claude-x" };

  it("sukses → baris asisten menyimpan latencyMs, providerSlot, model; baris user tidak", async () => {
    const { deps, appended } = timedDeps(() => loopResult());
    expect((await runChatTurn(ctx, input, {}, deps)).ok).toBe(true);
    const [userRow, assistantRow] = appended[0].rows;
    expect(assistantRow).toMatchObject({ role: "assistant", status: "ok", ...TELEMETRY });
    expect(assistantRow.errorDetail).toBeUndefined();
    expect(userRow).toEqual({ role: "user", content: "Halo Jenna", status: "ok", modality: "text" });
  });

  it("gagal provider → baris user error menyimpan telemetri + status & detail vendor; ChatFailure tetap bersih", async () => {
    const detail = '{"error":{"message":"Incorrect API key provided"}}';
    const { deps, appended } = timedDeps(() => {
      throw new AiProviderError("config", "pesan publik", 401, { detail });
    });
    const out = await expectFailure(deps);
    expect(appended[0].rows).toEqual([
      expect.objectContaining({
        role: "user",
        status: "error",
        errorCode: "provider_config",
        errorDetail: `HTTP 401: ${detail}`,
        ...TELEMETRY,
      }),
    ]);
    expect(out).toEqual({ ok: false, status: 503, code: "provider_error", message: CHAT_MESSAGES.provider_unavailable });
    expect(JSON.stringify(out)).not.toContain("Incorrect API key");
  });

  it("error internal → `Nama: pesan` disanitasi (kredensial, PII, batas 2000) dan tidak bocor ke ChatFailure", async () => {
    const { deps, appended } = timedDeps(() => {
      throw new TypeError(`gagal\n  Bearer abc.DEF-123 sk-live_9999 hubungi 081234567890 ${"x".repeat(3000)}`);
    });
    const out = await expectFailure(deps);
    const saved = appended[0].rows[0].errorDetail ?? "";
    expect(saved.startsWith("TypeError: gagal Bearer [kunci disamarkan] [kunci disamarkan] hubungi [nomor disamarkan] xxx")).toBe(true);
    expect(saved).toHaveLength(2000);
    expect(appended[0].rows[0]).toMatchObject({ errorCode: "internal", ...TELEMETRY });
    expect(out).toEqual({ ok: false, status: 500, code: "provider_error", message: CHAT_MESSAGES.internal });
  });

  it("timeout → `TurnTimeoutError: …`; client_closed → tanpa errorDetail tetapi telemetri tetap ada", async () => {
    const timeout = timedDeps(() => {
      throw new TurnTimeoutError();
    });
    await expectFailure(timeout.deps);
    expect(timeout.appended[0].rows[0]).toMatchObject({ errorCode: "timeout", ...TELEMETRY });
    expect(timeout.appended[0].rows[0].errorDetail).toMatch(/^TurnTimeoutError: \S/);

    const ctrl = new AbortController();
    const closed = timedDeps(() => {
      ctrl.abort();
      throw new Error("aborted sk-RAHASIA-1");
    });
    await runChatTurn(ctx, input, { signal: ctrl.signal }, closed.deps);
    expect(closed.appended[0].rows[0]).toMatchObject({ errorCode: "client_closed", errorDetail: null, ...TELEMETRY });
  });
});

describe("retensi", () => {
  it("menghapus percakapan dan sesi suara lebih lama dari retentionDays", async () => {
    const deleteBefore = vi.fn(async () => 3);
    const deleteVoiceSessionsBefore = vi.fn(async () => 2);
    const n = await purgeExpiredJennaConversations({
      loadRetentionDays: async () => 30,
      deleteBefore,
      deleteVoiceSessionsBefore,
      now: () => NOW,
    });
    expect(n).toBe(3);
    const cutoff = new Date(NOW.getTime() - 30 * 86_400_000);
    expect(deleteBefore).toHaveBeenCalledWith(cutoff);
    expect(deleteVoiceSessionsBefore).toHaveBeenCalledWith(cutoff);
  });

  it("retentionDays tidak valid → tidak menghapus apa pun", async () => {
    const deleteBefore = vi.fn(async () => 0);
    const deleteVoiceSessionsBefore = vi.fn(async () => 0);
    expect(
      await purgeExpiredJennaConversations({ loadRetentionDays: async () => 0, deleteBefore, deleteVoiceSessionsBefore }),
    ).toBe(0);
    expect(deleteBefore).not.toHaveBeenCalled();
    expect(deleteVoiceSessionsBefore).not.toHaveBeenCalled();
  });

  it("scheduler hanya production, bukan saat build, dan sekali per proses", () => {
    expect(isJennaRetentionSchedulerEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(isJennaRetentionSchedulerEnabled({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" })).toBe(false);

    const timeouts: [() => void, number][] = [];
    const intervals: number[] = [];
    const timers = {
      setTimeout: (fn: () => void, ms: number) => (timeouts.push([fn, ms]), undefined),
      setInterval: (_fn: () => void, ms: number) => (intervals.push(ms), undefined),
    };
    const run = vi.fn(async () => 0);
    const store = {};
    const env = { NODE_ENV: "production" };
    expect(startJennaRetentionScheduler({ run, env, timers, store })).toBe(true);
    expect(startJennaRetentionScheduler({ run, env, timers, store })).toBe(false);
    expect(startJennaRetentionScheduler({ run, env: { NODE_ENV: "development" }, timers, store: {} })).toBe(false);
    expect(timeouts.map(([, ms]) => ms)).toEqual([JENNA_PURGE_JEDA_AWAL_MS]);
    timeouts[0][0]();
    expect(run).toHaveBeenCalledTimes(1);
    expect(intervals).toEqual([JENNA_PURGE_INTERVAL_MS]);
  });
});
