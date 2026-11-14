// Kontrak provider LLM untuk runtime Jenna (format netral, bukan format vendor). Murni tanpa import.

export interface ToolCall {
  id: string;
  name: string;
  /** JSON mentah dari LLM; "{}" bila kosong. Validasi/parsing dilakukan oleh executor tool. */
  arguments: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  /** Hanya untuk role "assistant" yang meminta tool. */
  toolCalls?: ToolCall[];
  /** Hanya untuk role "tool": id panggilan yang dijawab. */
  toolCallId?: string;
}

/** Deskripsi tool untuk LLM. `parameters` = objek JSON Schema (subset), sengaja struktural. */
export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

/** `usage` undefined hanya bila provider tidak melaporkannya sama sekali. */
export type ChatResult =
  | { type: "text"; text: string; usage?: TokenUsage }
  | { type: "tool_calls"; toolCalls: ToolCall[]; text?: string; usage?: TokenUsage };

export interface ChatOptions {
  tools?: ToolSpec[];
  signal?: AbortSignal;
  /** Diisi = minta jawaban di-stream; hasil akhir tetap dikembalikan utuh. */
  onDelta?: (text: string) => void;
}

export interface AIProvider {
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
}

/**
 * `config` = kredensial/URL/model salah (401/403/4xx lain, redirect), `busy` = 429/529,
 * `unavailable` = 5xx/timeout/jaringan/dibatalkan, `bad_response` = respons tak terbaca.
 */
export type AiProviderErrorKind = "config" | "busy" | "unavailable" | "bad_response";

/** Pesan aman tampil ke publik; body/header vendor tidak pernah masuk `message`. `cause` hanya untuk log. */
export class AiProviderError extends Error {
  /** Penyebab asli untuk developer (body/teks vendor); disanitasi adapter sebelum keluar. Tidak pernah ke pengunjung. */
  detail?: string;

  constructor(
    readonly kind: AiProviderErrorKind,
    message: string,
    readonly status?: number,
    options?: { cause?: unknown; detail?: string },
  ) {
    super(message, options);
    this.name = "AiProviderError";
    if (options?.detail) this.detail = options.detail;
  }
}
