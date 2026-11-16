// Akumulasi stream `/v1/messages` (`stream: true`): `text_delta` diteruskan ke `onDelta`,
// `input_json_delta` digabung per indeks blok `tool_use`, usage dari message_start/message_delta.
import { readSseStream } from "../runtime/sse-parser";
import { BAD_CHUNK_MAX_CHARS, clipJson, normalizeArguments, PROVIDER_ERROR_MESSAGES } from "./common";
import { AiProviderError, type ChatResult, type TokenUsage, type ToolCall } from "./types";

export interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface AnthropicStreamEvent {
  type?: string;
  message?: { usage?: AnthropicUsage };
  index?: number;
  content_block?: { type?: string; id?: string; name?: string };
  delta?: { type?: string; text?: string; partial_json?: string };
  usage?: AnthropicUsage;
  error?: { type?: string; message?: string };
}

/** Stream berakhir tanpa event terbaca atau chunk bukan JSON. */
export class AnthropicStreamFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnthropicStreamFormatError";
  }
}

/** Token input termasuk cache (prompt cache tetap dihitung untuk budget harian). */
export const inputTokensOf = (u: AnthropicUsage | undefined): number =>
  (u?.input_tokens ?? 0) + (u?.cache_creation_input_tokens ?? 0) + (u?.cache_read_input_tokens ?? 0);

export function createAnthropicAccumulator(onDelta: (text: string) => void) {
  let text = "";
  let sawEvent = false;
  let inputTokens = 0;
  let outputTokens = 0;
  let hasUsage = false;
  let streamError: AiProviderError | undefined;
  const calls = new Map<number, { id?: string; name: string; args: string }>();

  return {
    push(ev: AnthropicStreamEvent) {
      sawEvent = true;
      switch (ev.type) {
        case "message_start":
          if (ev.message?.usage) {
            hasUsage = true;
            inputTokens = inputTokensOf(ev.message.usage);
            outputTokens = ev.message.usage.output_tokens ?? 0;
          }
          break;
        case "content_block_start":
          if (ev.content_block?.type === "tool_use") {
            calls.set(ev.index ?? 0, { id: ev.content_block.id, name: ev.content_block.name ?? "", args: "" });
          }
          break;
        case "content_block_delta":
          if (ev.delta?.type === "text_delta" && ev.delta.text) {
            text += ev.delta.text;
            onDelta(ev.delta.text);
          } else if (ev.delta?.type === "input_json_delta") {
            const call = calls.get(ev.index ?? 0);
            if (call) call.args += ev.delta.partial_json ?? "";
          }
          break;
        case "message_delta":
          if (ev.usage) {
            hasUsage = true;
            outputTokens = ev.usage.output_tokens ?? outputTokens;
            const more = inputTokensOf(ev.usage);
            if (more > 0) inputTokens = more;
          }
          break;
        case "error": {
          const kind = ev.error?.type;
          const options = { detail: `Event error di stream: ${clipJson(ev.error ?? null)}` };
          streamError =
            kind === "overloaded_error" || kind === "rate_limit_error"
              ? new AiProviderError("busy", PROVIDER_ERROR_MESSAGES.busy, undefined, options)
              : new AiProviderError("unavailable", PROVIDER_ERROR_MESSAGES.unavailable, undefined, options);
          break;
        }
        default:
          // ping, content_block_stop, message_stop: tidak perlu diproses.
          break;
      }
    },
    result(): ChatResult {
      if (streamError) throw streamError;
      if (!sawEvent) throw new AnthropicStreamFormatError("Empty stream");
      const usage: TokenUsage | undefined = hasUsage ? { inputTokens, outputTokens } : undefined;
      const toolCalls: ToolCall[] = [...calls.entries()]
        .sort(([a], [b]) => a - b)
        .filter(([, c]) => c.name)
        .map(([i, c]) => ({ id: c.id || `call_${i}`, name: c.name, arguments: normalizeArguments(c.args) }));
      return toolCalls.length > 0
        ? { type: "tool_calls", toolCalls, text: text || undefined, usage }
        : { type: "text", text, usage };
    },
  };
}

/** Baca body SSE provider sampai habis lalu kembalikan hasil akhir. */
export async function readAnthropicStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
): Promise<ChatResult> {
  const acc = createAnthropicAccumulator(onDelta);
  let badChunk: string | undefined;
  await readSseStream(body, ({ data }) => {
    if (badChunk !== undefined) return;
    try {
      acc.push(JSON.parse(data) as AnthropicStreamEvent);
    } catch {
      // Satu chunk rusak membuat hasil tak bisa dipercaya: gagal di akhir sebagai bad_response.
      badChunk = data;
    }
  });
  if (badChunk !== undefined) {
    throw new AnthropicStreamFormatError(`Invalid JSON chunk in stream: ${badChunk.slice(0, BAD_CHUNK_MAX_CHARS)}`);
  }
  return acc.result();
}
