// Adapter endpoint `/v1/messages` bergaya Anthropic (fetch saja, tanpa SDK).
import { describeError } from "../error-detail";
import { createDeadline } from "../runtime/deadline";
import { AnthropicStreamFormatError, type AnthropicUsage, inputTokensOf, readAnthropicStream } from "./anthropic-stream";
import {
  ANTHROPIC_VERSION,
  anthropicMessagesUrl,
  badResponse,
  clipJson,
  DEFAULT_MAX_TOKENS,
  errorForStatus,
  type FetchLike,
  isEventStream,
  parseArguments,
  type ProviderConfig,
  readErrorBody,
  sealErrorDetail,
  unavailable,
} from "./common";
import {
  type AIProvider,
  AiProviderError,
  type ChatMessage,
  type ChatOptions,
  type ChatResult,
  type ToolCall,
  type ToolSpec,
} from "./types";

type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: Block[];
}

interface AnthropicResponse {
  content?: Array<{ type?: string; text?: string; id?: string; name?: string; input?: unknown }>;
  usage?: AnthropicUsage;
}

/**
 * Format netral → Anthropic: system dipisah, hasil tool menjadi blok `tool_result` di pesan user,
 * dan pesan beruntun dengan role sama digabung (Anthropic mewajibkan role bergantian).
 */
export function toAnthropicPayload(messages: ChatMessage[]): { system: string; messages: AnthropicMessage[] } {
  const system: string[] = [];
  const out: AnthropicMessage[] = [];
  const push = (role: "user" | "assistant", blocks: Block[]) => {
    if (blocks.length === 0) return;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content.push(...blocks);
    else out.push({ role, content: blocks });
  };

  for (const m of messages) {
    if (m.role === "system") {
      if (m.content) system.push(m.content);
    } else if (m.role === "tool") {
      push("user", [{ type: "tool_result", tool_use_id: m.toolCallId ?? "", content: m.content }]);
    } else if (m.role === "assistant") {
      const blocks: Block[] = [];
      if (m.content) blocks.push({ type: "text", text: m.content });
      for (const c of m.toolCalls ?? []) {
        blocks.push({ type: "tool_use", id: c.id, name: c.name, input: parseArguments(c.arguments) });
      }
      push("assistant", blocks);
    } else {
      push("user", m.content ? [{ type: "text", text: m.content }] : []);
    }
  }
  return { system: system.join("\n\n"), messages: out };
}

const toAnthropicTool = (t: ToolSpec) => ({ name: t.name, description: t.description, input_schema: t.parameters });

export class AnthropicProvider implements AIProvider {
  constructor(
    private readonly config: ProviderConfig,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const payload = toAnthropicPayload(messages);
    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
      messages: payload.messages,
    };
    if (payload.system) {
      body.system = [{ type: "text", text: payload.system, cache_control: { type: "ephemeral" } }];
    }
    if (opts.tools?.length) {
      body.tools = opts.tools.map(toAnthropicTool);
      body.tool_choice = { type: "auto" };
    }
    if (this.config.temperature !== null) body.temperature = this.config.temperature;
    if (opts.onDelta) body.stream = true;

    const deadline = createDeadline(this.config.timeoutMs, opts.signal);
    try {
      let res: Response;
      try {
        res = await this.fetchImpl(anthropicMessagesUrl(this.config.baseUrl), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": ANTHROPIC_VERSION,
          },
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

      let json: AnthropicResponse;
      try {
        json = (await res.json()) as AnthropicResponse;
      } catch (err) {
        if (deadline.signal.aborted) throw unavailable(err);
        throw badResponse(res.status, describeError(err));
      }
      const result = parseResponse(json);
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
    return await readAnthropicStream(res.body, onDelta);
  } catch (err) {
    if (err instanceof AiProviderError) throw err;
    if (err instanceof AnthropicStreamFormatError) throw badResponse(res.status, err.message);
    throw unavailable(err);
  }
}

function parseResponse(json: AnthropicResponse): ChatResult {
  if (!Array.isArray(json.content)) throw badResponse(undefined, `Respons tanpa content[]: ${clipJson(json)}`);
  const usage = json.usage
    ? { inputTokens: inputTokensOf(json.usage), outputTokens: json.usage.output_tokens ?? 0 }
    : undefined;

  const text = json.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
  const toolCalls: ToolCall[] = json.content
    .filter((b) => b.type === "tool_use" && b.name)
    .map((b, i) => ({
      id: b.id || `call_${i}`,
      name: b.name ?? "",
      arguments: b.input && typeof b.input === "object" && !Array.isArray(b.input) ? JSON.stringify(b.input) : "{}",
    }));

  if (toolCalls.length > 0) return { type: "tool_calls", toolCalls, text: text || undefined, usage };
  return { type: "text", text, usage };
}
