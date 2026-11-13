// Memilih adapter provider teks sesuai protokol slot aktif.
import type { JennaChatProtocol } from "../types";
import { AnthropicProvider } from "./anthropic";
import type { FetchLike, ProviderConfig } from "./common";
import { OpenAICompatibleProvider } from "./openai-compatible";
import type { AIProvider } from "./types";

export function createTextProvider(
  protocol: JennaChatProtocol,
  config: ProviderConfig,
  fetchImpl: FetchLike = fetch,
): AIProvider {
  return protocol === "anthropic"
    ? new AnthropicProvider(config, fetchImpl)
    : new OpenAICompatibleProvider(config, fetchImpl);
}
