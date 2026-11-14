// @vitest-environment node
// Loop LLM ⇄ tool: iterasi tool, batas iterasi, timeout giliran, delta, usage, toolsUsed.
import { describe, expect, it, vi } from "vitest";
import {
  executeWithTools,
  MAX_ITERATIONS_MESSAGE,
  TurnTimeoutError,
} from "@/lib/jenna/chat/executor-loop";
import type { AIProvider, ChatMessage, ChatOptions, ChatResult } from "@/lib/jenna/provider/types";
import type { JennaTool } from "@/lib/jenna/tools/types";

const routes = new Set(["/profil"]);

const tool = (name: string): JennaTool => ({
  spec: { name, description: name, parameters: { type: "object", properties: {} } },
  run: vi.fn(async () => ({ ok: true as const, items: [{ title: "Profil", url: "/profil", text: `hasil ${name}` }] })),
});

function scripted(results: ChatResult[]) {
  const calls: { messages: ChatMessage[]; opts?: ChatOptions }[] = [];
  const provider: AIProvider = {
    chat: vi.fn(async (messages, opts) => {
      calls.push({ messages: [...messages], opts });
      const next = results.shift();
      if (!next) throw new Error("skrip habis");
      if (next.type === "text") opts?.onDelta?.(next.text);
      return next;
    }),
  };
  return { provider, calls };
}

const base = [
  { role: "system" as const, content: "sys" },
  { role: "user" as const, content: "halo" },
];

describe("executeWithTools", () => {
  it("menjalankan tool lalu mengembalikan teks; usage diakumulasi", async () => {
    const cari = tool("cari_konten");
    const { provider, calls } = scripted([
      {
        type: "tool_calls",
        toolCalls: [
          { id: "c1", name: "cari_konten", arguments: "{}" },
          { id: "c2", name: "tidak_ada", arguments: "{}" },
        ],
        usage: { inputTokens: 10, outputTokens: 2 },
      },
      { type: "text", text: "Jawaban [DATA]akhir[/DATA]", usage: { inputTokens: 20, outputTokens: 5 } },
    ]);
    const deltas: string[] = [];
    const toolCalls: string[] = [];
    const usages: number[] = [];
    const toolResults: string[] = [];

    const res = await executeWithTools(provider, {
      messages: base,
      tools: [cari],
      routes,
      onDelta: (t) => deltas.push(t),
      onToolCall: (n) => toolCalls.push(n),
      onToolResult: (c) => toolResults.push(c),
      onUsage: (u) => usages.push(u.inputTokens + u.outputTokens),
    });

    expect(res).toMatchObject({
      text: "Jawaban akhir",
      toolsUsed: ["cari_konten"],
      iterations: 2,
      stopReason: "end",
      usage: { inputTokens: 30, outputTokens: 7 },
    });
    expect(toolCalls).toEqual(["cari_konten", "tidak_ada"]);
    expect(usages).toEqual([12, 25]);
    expect(deltas).toEqual(["Jawaban [DATA]akhir[/DATA]"]);
    expect(cari.run).toHaveBeenCalledTimes(1);
    expect(res.toolResults).toHaveLength(2);
    expect(res.toolResults[0]).toContain("hasil cari_konten");
    expect(toolResults).toEqual(res.toolResults);

    const second = calls[1].messages;
    expect(second.slice(0, 2)).toEqual(base);
    expect(second[2]).toMatchObject({ role: "assistant", toolCalls: [{ id: "c1" }, { id: "c2" }] });
    expect(second.slice(3).map((m) => [m.role, m.toolCallId])).toEqual([
      ["tool", "c1"],
      ["tool", "c2"],
    ]);
    expect(calls[0].opts?.tools?.map((t) => t.name)).toEqual(["cari_konten"]);
    expect(base).toHaveLength(2);
  });

  it("berhenti di maxIterations dengan pesan Indonesia", async () => {
    const loop: ChatResult = {
      type: "tool_calls",
      toolCalls: [{ id: "x", name: "agenda", arguments: "{}" }],
      usage: { inputTokens: 1, outputTokens: 1 },
    };
    const { provider } = scripted(Array.from({ length: 10 }, () => ({ ...loop })));
    const res = await executeWithTools(provider, { messages: base, tools: [tool("agenda")], routes, limits: { maxIterations: 3 } });
    expect(res).toMatchObject({ text: MAX_ITERATIONS_MESSAGE, stopReason: "max_iterations", iterations: 3 });
    expect(provider.chat).toHaveBeenCalledTimes(3);
    expect(res.usage).toEqual({ inputTokens: 3, outputTokens: 3 });
  });

  it("default maxIterations = 6", async () => {
    const { provider } = scripted(
      Array.from({ length: 10 }, (_, i) => ({
        type: "tool_calls" as const,
        toolCalls: [{ id: `x${i}`, name: "agenda", arguments: "{}" }],
      })),
    );
    await executeWithTools(provider, { messages: base, tools: [tool("agenda")], routes });
    expect(provider.chat).toHaveBeenCalledTimes(6);
  });

  it("habis waktu giliran → TurnTimeoutError", async () => {
    const provider: AIProvider = { chat: () => new Promise(() => {}) };
    await expect(
      executeWithTools(provider, { messages: base, tools: [], routes, limits: { turnTimeoutMs: 20 } }),
    ).rejects.toBeInstanceOf(TurnTimeoutError);
  });

  it("dibatalkan klien → bukan TurnTimeoutError", async () => {
    const ctrl = new AbortController();
    const provider: AIProvider = { chat: () => new Promise(() => {}) };
    const pending = executeWithTools(provider, { messages: base, tools: [], routes, signal: ctrl.signal });
    ctrl.abort();
    const err = await pending.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(TurnTimeoutError);
  });

  it("tanpa tool → provider tidak menerima daftar tools", async () => {
    const { provider, calls } = scripted([{ type: "text", text: "ok" }]);
    const res = await executeWithTools(provider, { messages: base, tools: [], routes });
    expect(calls[0].opts?.tools).toBeUndefined();
    expect(res.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });
});
