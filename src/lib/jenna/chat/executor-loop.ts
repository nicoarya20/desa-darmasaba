// Loop LLM ⇄ tool satu giliran chat: batas iterasi & waktu giliran, delta di-stream, usage diakumulasi.
// Eksekusi tiap tool (timeout, batas panggilan, pembungkus DATA) ada di tools/executor.ts.
import { createDeadline, raceWithSignal } from "../runtime/deadline";
import type { AIProvider, ChatMessage, TokenUsage, ToolSpec } from "../provider/types";
import { runToolCalls, sanitizeResponse, EXECUTOR_LIMITS } from "../tools/executor";
import type { JennaTool } from "../tools/types";

export const LOOP_LIMITS = {
  maxIterations: 6,
  turnTimeoutMs: 60_000,
} as const;

export type LoopLimits = { -readonly [K in keyof typeof LOOP_LIMITS]: number };

export const MAX_ITERATIONS_MESSAGE =
  "Maaf, pertanyaan Anda terlalu rumit untuk saya jawab sekaligus. Silakan pecah menjadi pertanyaan yang lebih sederhana.";
export const TURN_TIMEOUT_MESSAGE = "Jenna terlalu lama merespons. Silakan coba lagi sebentar.";

/** Giliran melewati `turnTimeoutMs` (bukan dibatalkan klien). */
export class TurnTimeoutError extends Error {
  constructor(options?: { cause?: unknown }) {
    super(TURN_TIMEOUT_MESSAGE, options);
    this.name = "TurnTimeoutError";
  }
}

export interface LoopOptions {
  messages: ChatMessage[];
  tools: readonly JennaTool[];
  /** Route terlihat untuk tool (sumber & tautan). */
  routes: Set<string>;
  /** Batal dari klien (koneksi ditutup). */
  signal?: AbortSignal;
  onDelta?: (text: string) => void;
  /** Dipanggil sebelum tool dijalankan (nama mentah dari LLM). */
  onToolCall?: (name: string) => void;
  /** Isi tiap hasil tool (sudah dibungkus DATA), segera setelah tool selesai. */
  onToolResult?: (content: string) => void;
  /** Usage tiap panggilan provider — agar giliran yang gagal di tengah tetap tercatat. */
  onUsage?: (usage: TokenUsage) => void;
  limits?: Partial<LoopLimits>;
}

export interface LoopResult {
  text: string;
  toolsUsed: string[];
  iterations: number;
  usage: TokenUsage;
  stopReason: "end" | "max_iterations";
  /** Isi hasil tool (sudah dibungkus DATA) — dasar pengecualian PII output guard. */
  toolResults: string[];
}

export async function executeWithTools(provider: AIProvider, opts: LoopOptions): Promise<LoopResult> {
  const limits: LoopLimits = { ...LOOP_LIMITS, ...opts.limits };
  const specs: ToolSpec[] | undefined = opts.tools.length > 0 ? opts.tools.map((t) => t.spec) : undefined;
  const known = new Set(opts.tools.map((t) => t.spec.name));
  const turn = createDeadline(limits.turnTimeoutMs, opts.signal);
  const messages = [...opts.messages];
  const toolsUsed: string[] = [];
  const toolResults: string[] = [];
  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
  const result = (text: string, iterations: number, stopReason: LoopResult["stopReason"]): LoopResult => ({
    text,
    toolsUsed,
    iterations,
    usage,
    stopReason,
    toolResults,
  });

  try {
    for (let iteration = 1; iteration <= limits.maxIterations; iteration++) {
      const res = await raceWithSignal(
        provider.chat(messages, { tools: specs, signal: turn.signal, onDelta: opts.onDelta }),
        turn.signal,
      );
      const step = { inputTokens: res.usage?.inputTokens ?? 0, outputTokens: res.usage?.outputTokens ?? 0 };
      usage.inputTokens += step.inputTokens;
      usage.outputTokens += step.outputTokens;
      opts.onUsage?.(step);

      if (res.type === "text") return result(sanitizeResponse(res.text), iteration, "end");

      messages.push({ role: "assistant", content: res.text ?? "", toolCalls: res.toolCalls });
      for (const call of res.toolCalls.slice(0, EXECUTOR_LIMITS.maxCallsPerIteration)) {
        if (known.has(call.name) && !toolsUsed.includes(call.name)) toolsUsed.push(call.name);
        opts.onToolCall?.(call.name);
      }
      const outputs = await runToolCalls(res.toolCalls, opts.tools, { signal: turn.signal, routes: opts.routes });
      for (const out of outputs) {
        toolResults.push(out.content);
        opts.onToolResult?.(out.content);
        messages.push({ role: "tool", content: out.content, toolCallId: out.id });
      }
    }
    return result(MAX_ITERATIONS_MESSAGE, limits.maxIterations, "max_iterations");
  } catch (err) {
    // Batal klien diteruskan apa adanya; habis waktu giliran jadi TurnTimeoutError.
    if (turn.signal.aborted && !opts.signal?.aborted) throw new TurnTimeoutError({ cause: err });
    throw err;
  } finally {
    turn.dispose();
  }
}
