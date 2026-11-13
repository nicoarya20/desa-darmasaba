// Adapter endpoint `/chat/completions` bergaya OpenAI (fetch saja, tanpa SDK).
import { createDeadline } from "../runtime/deadline";
import {
  badResponse,
  DEFAULT_MAX_TOKENS,
  errorForStatus,
  type FetchLike,
  isEventStream,
  normalizeArguments,
  type ProviderConfig,
  unavailable,
} from "./common";
import { readOpenAIStream, StreamFormatError } from "./openai-stream";
import type { AIProvider, ChatMessage, ChatOptions, ChatResult, ToolCall, ToolSpec } from "./types";

interface OpenAIResponse {
  choices?: Array<{
    message?: { content?: string | null; tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }> };
  }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

function toOpenAIMessage(m: ChatMessage): Record<string, unknown> {
  if (m.role === "tool") return { role: "tool", tool_call_id: m.toolCallId, content: m.content };
  if (m.role === "assistant" && m.toolCalls?.length) {
    return {
      role: "assistant",
      content: m.content || null,
      tool_calls: m.toolCalls.map((c) => ({
        id: c.id,
        type: "function",
        function: { name: c.name, arguments: normalizeArguments(c.arguments) },
      })),
    };
  }
  return { role: m.role, content: m.content };
}

const toOpenAITool = (t: ToolSpec) => ({
  type: "function",
  function: { name: t.name, description: t.description, parameters: t.parameters },
});

export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    private readonly config: ProviderConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messages.map(toOpenAIMessage),
      max_tokens: this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
    };
    if (opts.tools?.length) {
      body.tools = opts.tools.map(toOpenAITool);
      body.tool_choice = "auto";
    }
    if (this.config.temperature !== null) body.temperature = this.config.temperature;
    if (opts.onDelta) {
      body.stream = true;
      body.stream_options = { include_usage: true };
    }

    const url = `${this.config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    // Deadline mencakup pembacaan body juga (stream bisa berjalan lama).
    const deadline = createDeadline(this.config.timeoutMs, opts.signal);
    try {
      let res: Response;
      try {
        res = await this.fetchImpl(url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${this.config.apiKey}` },
          body: JSON.stringify(body),
          redirect: "manual",
          cache: "no-store",
          signal: deadline.signal,
        });
      } catch (err) {
        throw unavailable(err);
      }

      if (!res.ok) {
        // Body vendor dibuang (bisa memuat detail akun); cukup status.
        await res.body?.cancel().catch(() => undefined);
        throw errorForStatus(res.status);
      }
      if (opts.onDelta && isEventStream(res)) return await readStream(res, opts.onDelta);

      let json: OpenAIResponse;
      try {
        json = (await res.json()) as OpenAIResponse;
      } catch (err) {
        if (deadline.signal.aborted) throw unavailable(err);
        throw badResponse(res.status);
      }
      const result = parseResponse(json);
      // Proxy yang mengabaikan `stream: true`: jawaban dikirim sebagai satu delta.
      if (opts.onDelta && result.type === "text" && result.text) opts.onDelta(result.text);
      return result;
    } finally {
      deadline.dispose();
    }
  }
}

async function readStream(res: Response, onDelta: (text: string) => void): Promise<ChatResult> {
  if (!res.body) throw badResponse(res.status);
  try {
    return await readOpenAIStream(res.body, onDelta);
  } catch (err) {
    if (err instanceof StreamFormatError) throw badResponse(res.status);
    // Stream putus di tengah (jaringan, timeout, atau giliran dibatalkan).
    throw unavailable(err);
  }
}

function parseResponse(json: OpenAIResponse): ChatResult {
  const message = json.choices?.[0]?.message;
  if (!message) throw badResponse();
  const usage = json.usage
    ? { inputTokens: json.usage.prompt_tokens ?? 0, outputTokens: json.usage.completion_tokens ?? 0 }
    : undefined;

  const toolCalls: ToolCall[] = (message.tool_calls ?? [])
    .filter((c) => c.function?.name)
    .map((c, i) => ({ id: c.id || `call_${i}`, name: c.function?.name ?? "", arguments: normalizeArguments(c.function?.arguments) }));

  if (toolCalls.length > 0) return { type: "tool_calls", toolCalls, text: message.content ?? undefined, usage };
  return { type: "text", text: message.content ?? "", usage };
}
