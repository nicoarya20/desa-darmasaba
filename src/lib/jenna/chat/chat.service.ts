// Satu giliran chat publik Jenna. `prepareChatTurn` menjalankan gerbang (murah → mahal) sebelum stream
// dibuka sehingga penolakan bisa dijawab JSON + status HTTP; `run` menjalankan LLM, guard, dan persist.
// Semua IO lewat `deps` agar bisa dites tanpa DB/jaringan (wiring produksi: chat/deps.ts).
import type { JennaErrorCode, JennaPageContext, JennaSource } from "../chat-types";
import { describeTurnError } from "../error-detail";
import { isAllowedJennaHref } from "../knowledge/sitemap";
import { checkInput, secondsUntilJakartaMidnight, startOfJakartaDay } from "../limits";
import { collectPiiValues, maskPii } from "../pii";
import { buildSystemPrompt, sanitizePageField, type PageContext } from "../prompt";
import type { ActiveJennaProvider } from "../provider/active";
import { AiProviderError, type AIProvider, type ChatMessage, type TokenUsage } from "../provider/types";
import type { JennaTool } from "../tools/types";
import type { Limiter } from "@/lib/rate-limit";
import { recordFailedTurn, saveTurn } from "./chat.persist";
import type { ChatRepo, HistoryMessage, Identity } from "./conversation.repo";
import { TurnTimeoutError, type LoopOptions, type LoopResult } from "./executor-loop";
import { createDeltaGuard, guardOutput } from "./output-guard";

export const CHAT_MESSAGES = {
  disabled: "Jenna sedang tidak aktif. Untuk informasi, silakan hubungi kantor desa.",
  not_ready: "Jenna belum siap dipakai. Silakan coba lagi nanti.",
  rate_limited: "Anda mengirim pesan terlalu cepat. Silakan coba lagi sebentar.",
  global_rate_limited: "Jenna sedang menerima banyak pertanyaan. Silakan coba lagi sebentar.",
  quota_exceeded: "Batas pesan harian Anda sudah tercapai. Silakan coba lagi besok.",
  busy: "Jenna masih menjawab pesan Anda sebelumnya. Tunggu sebentar lalu coba lagi.",
  budget_exhausted: "Jenna sedang istirahat, silakan coba lagi besok atau hubungi kantor desa.",
  provider_busy: "Layanan AI sedang sibuk. Silakan coba lagi sebentar.",
  provider_unavailable: "Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.",
  internal: "Terjadi kesalahan, silakan coba lagi.",
  empty_answer: "Maaf, saya belum bisa menjawab pertanyaan itu. Silakan hubungi kantor desa untuk informasi lebih lanjut.",
} as const;

export const BUSY_RETRY_AFTER_SEC = 5;

const TOOL_STATUS: Record<string, string> = {
  cari_konten: "Mencari informasi di website desa…",
  detail_konten: "Membuka detail konten…",
  agenda: "Memeriksa agenda desa…",
  cek_kantor_buka: "Memeriksa jam layanan kantor desa…",
};
const DEFAULT_TOOL_STATUS = "Mencari data…";

/** Teks status untuk pengunjung; nama tool internal tidak pernah dikirim. */
export const toolStatusText = (name: string) => TOOL_STATUS[name] ?? DEFAULT_TOOL_STATUS;

export interface ChatCtx extends Identity {
  requestId: string;
}

export interface ChatInput {
  message: string;
  conversationId?: string;
  pageContext?: JennaPageContext;
}

export interface ChatHooks {
  signal?: AbortSignal;
  onMeta?: (meta: { conversationId: string; requestId: string }) => void;
  onStatus?: (text: string) => void;
  onDelta?: (text: string) => void;
}

export interface ChatFailure {
  ok: false;
  status: number;
  code: JennaErrorCode;
  message: string;
  retryAfterSec?: number;
}

export interface ChatSuccess {
  ok: true;
  conversationId: string;
  text: string;
  sources: JennaSource[];
  usage: TokenUsage;
  toolsUsed: string[];
}

export type ChatOutcome = ChatSuccess | ChatFailure;

/** Lolos semua gerbang; `run` wajib dipanggil tepat sekali (melepas slot konkurensi sesi). */
export interface PreparedTurn {
  ok: true;
  run(hooks?: ChatHooks): Promise<ChatOutcome>;
}

export interface ConcurrencyGate {
  tryAcquire(key: string): boolean;
  release(key: string): void;
}

export function createConcurrencyGate(): ConcurrencyGate {
  const active = new Set<string>();
  return {
    tryAcquire(key) {
      if (active.has(key)) return false;
      active.add(key);
      return true;
    },
    release(key) {
      active.delete(key);
    },
  };
}

export interface ChatDeps {
  resolveProvider: () => Promise<ActiveJennaProvider>;
  repo: ChatRepo;
  limiters: { ip: Limiter; session: Limiter; global: Limiter };
  concurrency: ConcurrencyGate;
  getSnapshot: () => Promise<string>;
  getRoutes: () => Promise<Set<string>>;
  tools: readonly JennaTool[];
  execute: (provider: AIProvider, opts: LoopOptions) => Promise<LoopResult>;
  now: () => Date;
}

const fail = (status: number, code: JennaErrorCode, message: string, retryAfterSec?: number): ChatFailure =>
  retryAfterSec === undefined ? { ok: false, status, code, message } : { ok: false, status, code, message, retryAfterSec };

const retrySec = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

// Snapshot sama untuk banyak giliran (cache 30 menit) — himpunan PII tepercaya cukup dihitung sekali.
let trustedCache: { snapshot: string; values: Set<string> } | undefined;
function trustedPiiFor(snapshot: string, toolResults: readonly string[]): Set<string> {
  if (trustedCache?.snapshot !== snapshot) trustedCache = { snapshot, values: collectPiiValues([snapshot]) };
  if (toolResults.length === 0) return trustedCache.values;
  return new Set([...trustedCache.values, ...collectPiiValues(toolResults)]);
}

/** Riwayat dimulai dari pesan user (beberapa provider menolak asisten di posisi pertama). */
function trimHistory(history: HistoryMessage[]): ChatMessage[] {
  const start = history.findIndex((m) => m.role === "user");
  return start < 0 ? [] : history.slice(start);
}

type FailureInfo = { errorCode: string; outcome: ChatFailure };

function classifyFailure(err: unknown, clientAborted: boolean): FailureInfo {
  if (clientAborted) return { errorCode: "client_closed", outcome: fail(499, "provider_error", CHAT_MESSAGES.internal) };
  if (err instanceof TurnTimeoutError) return { errorCode: "timeout", outcome: fail(504, "timeout", err.message) };
  if (err instanceof AiProviderError) {
    const busy = err.kind === "busy";
    return {
      errorCode: `provider_${err.kind}`,
      outcome: fail(503, "provider_error", busy ? CHAT_MESSAGES.provider_busy : CHAT_MESSAGES.provider_unavailable),
    };
  }
  return { errorCode: "internal", outcome: fail(500, "provider_error", CHAT_MESSAGES.internal) };
}

export async function prepareChatTurn(ctx: ChatCtx, input: ChatInput, deps: ChatDeps): Promise<ChatFailure | PreparedTurn> {
  // 1. Saklar & kesiapan (readiness publik mewajibkan budget token harian > 0).
  const active = await deps.resolveProvider();
  const { settings } = active;
  if (!settings.enabled) return fail(409, "disabled", CHAT_MESSAGES.disabled);
  if ("notReady" in active || settings.dailyTokensGlobal <= 0) return fail(409, "not_ready", CHAT_MESSAGES.not_ready);

  // 2. Validasi input.
  const checked = checkInput(input.message, settings.maxInputChars);
  if (!checked.ok) return fail(422, "invalid_input", checked.message);

  // 3. Satu giliran aktif per sesi.
  if (!deps.concurrency.tryAcquire(ctx.sessionHash)) {
    return fail(429, "busy", CHAT_MESSAGES.busy, BUSY_RETRY_AFTER_SEC);
  }
  let handedOff = false;
  try {
    const now = deps.now();
    const nowMs = now.getTime();

    // 4. Per menit. Limiter in-memory per proses (src/lib/rate-limit.ts; deploy 1 instance), kuota harian & budget di DB.
    // IP → sesi → global: permintaan yang sudah ditolak per-IP tidak ikut menghabiskan plafon global pengunjung lain.
    for (const [limiter, key, max, message] of [
      [deps.limiters.ip, ctx.ipHash, settings.rateLimitPerMinute, CHAT_MESSAGES.rate_limited],
      [deps.limiters.session, ctx.sessionHash, settings.rateLimitPerMinute, CHAT_MESSAGES.rate_limited],
      [deps.limiters.global, "global", undefined, CHAT_MESSAGES.global_rate_limited],
    ] as const) {
      const hit = limiter.check(key, max, nowMs);
      if (!hit.allowed) return fail(429, "rate_limited", message, retrySec(hit.retryAfterMs));
    }

    // 5. Kuota harian per sesi dan per IP.
    const dayStart = startOfJakartaDay(now);
    const [bySession, byIp] = await Promise.all([
      deps.repo.countUserMessagesSince({ sessionHash: ctx.sessionHash }, dayStart),
      deps.repo.countUserMessagesSince({ ipHash: ctx.ipHash }, dayStart),
    ]);
    if (bySession >= settings.dailyMessagesUser || byIp >= settings.dailyMessagesUser) {
      return fail(429, "quota_exceeded", CHAT_MESSAGES.quota_exceeded, secondsUntilJakartaMidnight(now));
    }

    // 6. Budget token global hari ini.
    if ((await deps.repo.sumTokensSince(dayStart)) >= settings.dailyTokensGlobal) {
      return fail(503, "budget_exhausted", CHAT_MESSAGES.budget_exhausted);
    }

    const { provider, slot, model } = active;
    const userText = maskPii(checked.text);
    handedOff = true;
    return {
      ok: true,
      run: (hooks = {}) =>
        executeTurn(ctx, input, { provider, slot, model, settings, userText }, hooks, deps).finally(() =>
          deps.concurrency.release(ctx.sessionHash),
        ),
    };
  } finally {
    if (!handedOff) deps.concurrency.release(ctx.sessionHash);
  }
}

type Ready = {
  provider: AIProvider;
  /** Slot & model provider aktif — telemetri giliran. */
  slot: string;
  model: string;
  settings: ActiveJennaProvider["settings"];
  userText: string;
};

async function executeTurn(
  ctx: ChatCtx,
  input: ChatInput,
  { provider, slot, model, settings, userText }: Ready,
  hooks: ChatHooks,
  deps: ChatDeps,
): Promise<ChatOutcome> {
  const startedAt = deps.now().getTime();
  const telemetryAt = (savedAt: Date) => ({ latencyMs: savedAt.getTime() - startedAt, providerSlot: slot, model });
  const who: Identity = { sessionHash: ctx.sessionHash, ipHash: ctx.ipHash };
  const partial: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  const toolsSeen: string[] = [];
  let conversationId: string | undefined;

  try {
    const [routes, snapshot] = await Promise.all([deps.getRoutes(), deps.getSnapshot()]);

    // Percakapan milik sesi lain / tidak ada → percakapan baru, tanpa membedakan keduanya.
    const owned = input.conversationId
      ? await deps.repo.findOwnedConversation(input.conversationId, ctx.sessionHash)
      : null;
    conversationId = owned?.id ?? (await deps.repo.createConversation(who, deps.now()));
    hooks.onMeta?.({ conversationId, requestId: ctx.requestId });

    // History hanya dari DB; riwayat kiriman klien tidak pernah dipakai.
    const history = owned ? trimHistory(await deps.repo.recentMessages(owned.id, settings.historyWindow)) : [];

    const route = input.pageContext ? sanitizePageField(input.pageContext.route) : "";
    const pageContext: PageContext | undefined =
      route && isAllowedJennaHref(route, routes) ? { route, title: input.pageContext?.title } : undefined;

    const system = buildSystemPrompt({
      assistantName: settings.assistantName,
      personaNote: settings.personaNote,
      snapshot,
      toolNames: deps.tools.map((t) => t.spec.name),
      pageContext,
    });

    // Salinan per giliran: set cache snapshot tidak boleh ikut bertambah oleh hasil tool.
    const streamTrusted = new Set(trustedPiiFor(snapshot, []));
    const onDelta = hooks.onDelta;
    const deltaGuard = onDelta ? createDeltaGuard({ routes, trustedPii: streamTrusted, emit: onDelta }) : undefined;

    const turn = await deps.execute(provider, {
      messages: [{ role: "system", content: system }, ...history, { role: "user", content: userText }],
      tools: deps.tools,
      routes,
      signal: hooks.signal,
      onDelta: deltaGuard && ((text) => deltaGuard.push(text)),
      onToolResult: (content) => {
        for (const value of collectPiiValues([content])) streamTrusted.add(value);
      },
      onToolCall: (name) => {
        if (!toolsSeen.includes(name) && deps.tools.some((t) => t.spec.name === name)) toolsSeen.push(name);
        hooks.onStatus?.(toolStatusText(name));
      },
      onUsage: (step) => {
        partial.inputTokens += step.inputTokens;
        partial.outputTokens += step.outputTokens;
      },
    });

    const guarded = guardOutput(turn.text, routes, trustedPiiFor(snapshot, turn.toolResults));
    const text = guarded.text || CHAT_MESSAGES.empty_answer;
    const savedAt = deps.now();
    await saveTurn(deps.repo, {
      conversationId,
      who,
      userText,
      assistantText: text,
      toolsUsed: turn.toolsUsed,
      usage: turn.usage,
      telemetry: telemetryAt(savedAt),
      now: savedAt,
    });
    return { ok: true, conversationId, text, sources: guarded.sources, usage: turn.usage, toolsUsed: turn.toolsUsed };
  } catch (err) {
    const { errorCode, outcome } = classifyFailure(err, hooks.signal?.aborted === true);
    if (errorCode !== "client_closed") {
      console.error("[jenna] chat turn gagal", {
        requestId: ctx.requestId,
        errorCode,
        kind: err instanceof AiProviderError ? err.kind : undefined,
        status: err instanceof AiProviderError ? err.status : undefined,
        err,
      });
    }
    if (conversationId) {
      try {
        const savedAt = deps.now();
        await recordFailedTurn(deps.repo, {
          conversationId,
          who,
          userText,
          errorCode,
          // Hanya ke DB untuk developer console; `outcome` (publik) tidak pernah memuatnya.
          errorDetail: errorCode === "client_closed" ? null : describeTurnError(err),
          usage: partial,
          toolsUsed: toolsSeen,
          telemetry: telemetryAt(savedAt),
          now: savedAt,
        });
      } catch (persistErr) {
        console.error("[jenna] gagal menyimpan giliran error", { requestId: ctx.requestId, err: persistErr });
      }
    }
    return outcome;
  }
}

export async function runChatTurn(ctx: ChatCtx, input: ChatInput, hooks: ChatHooks, deps: ChatDeps): Promise<ChatOutcome> {
  const prepared = await prepareChatTurn(ctx, input, deps);
  return prepared.ok ? prepared.run(hooks) : prepared;
}
