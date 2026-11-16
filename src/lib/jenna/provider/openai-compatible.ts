// Adapter endpoint `/chat/completions` bergaya OpenAI (fetch saja, tanpa SDK).
import { describeError } from "../error-detail";
import { resolveReasoningEffort } from "../reasoning";
import { createDeadline } from "../runtime/deadline";
import {
  badResponse,
  clipJson,
  DEFAULT_MAX_TOKENS,
  errorForStatus,
  type FetchLike,
  isEventStream,
  normalizeArguments,
  type ProviderConfig,
  readErrorBody,
  sealErrorDetail,
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

export const openAIChatUrl = (baseUrl: string): string => `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

/** Body Chat Completions; dipakai adapter dan tes koneksi supaya aturan parameternya satu. */
export function buildOpenAIChatBody(
  config: Pick<ProviderConfig, "model" | "temperature" | "maxTokens" | "reasoningEffort">,
  messages: ChatMessage[],
  tools: ToolSpec[] | undefined,
  stream: boolean,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages: messages.map(toOpenAIMessage),
  };
  const maxTokens = config.maxTokens ?? DEFAULT_MAX_TOKENS;
  const reasoningEffort = resolveReasoningEffort(config.model, config.reasoningEffort);
  // Model reasoning menolak `max_tokens` dan umumnya `temperature`; server OpenAI-compatible lain
  // belum tentu kenal `max_completion_tokens`.
  if (reasoningEffort) {
    body.reasoning_effort = reasoningEffort;
    body.max_completion_tokens = maxTokens;
  } else {
    body.max_tokens = maxTokens;
    if (config.temperature !== null) body.temperature = config.temperature;
  }
  if (tools?.length) {
    body.tools = tools.map(toOpenAITool);
    body.tool_choice = "auto";
  }
  if (stream) {
    body.stream = true;
    body.stream_options = { include_usage: true };
  }
  return body;
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    private readonly config: ProviderConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const body = buildOpenAIChatBody(this.config, messages, opts.tools, Boolean(opts.onDelta));
    const url = openAIChatUrl(this.config.baseUrl);
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
        // Body vendor hanya masuk `detail` (developer console), tidak pernah ke `message` publik.
        throw errorForStatus(res.status, await readErrorBody(res));
      }
      if (opts.onDelta && isEventStream(res)) return await readStream(res, opts.onDelta);

      let json: OpenAIResponse;
      try {
        json = (await res.json()) as OpenAIResponse;
      } catch (err) {
        if (deadline.signal.aborted) throw unavailable(err);
        throw badResponse(res.status, describeError(err));
      }
      const result = parseResponse(json);
      // Proxy yang mengabaikan `stream: true`: jawaban dikirim sebagai satu delta.
      if (opts.onDelta && result.type === "text" && result.text) opts.onDelta(result.text);
      return result;
    } catch (err) {
      throw sealErrorDetail(err, this.config.apiKey);
    } finally {
      deadline.dispose();
    }
  }
}

async function readStream(res: Response, onDelta: (text: string) => void): Promise<ChatResult> {
  if (!res.body) throw badResponse(res.status, "Stream tanpa body");
  try {
    return await readOpenAIStream(res.body, onDelta);
  } catch (err) {
    if (err instanceof StreamFormatError) throw badResponse(res.status, err.message);
    // Stream putus di tengah (jaringan, timeout, atau giliran dibatalkan).
    throw unavailable(err);
  }
}

function parseResponse(json: OpenAIResponse): ChatResult {
  const message = json.choices?.[0]?.message;
  if (!message) throw badResponse(undefined, `Respons tanpa choices[0].message: ${clipJson(json)}`);
  const usage = json.usage
    ? { inputTokens: json.usage.prompt_tokens ?? 0, outputTokens: json.usage.completion_tokens ?? 0 }
    : undefined;

  const toolCalls: ToolCall[] = (message.tool_calls ?? [])
    .filter((c) => c.function?.name)
    .map((c, i) => ({ id: c.id || `call_${i}`, name: c.function?.name ?? "", arguments: normalizeArguments(c.function?.arguments) }));

  if (toolCalls.length > 0) return { type: "tool_calls", toolCalls, text: message.content ?? undefined, usage };
  return { type: "text", text: message.content ?? "", usage };
}
