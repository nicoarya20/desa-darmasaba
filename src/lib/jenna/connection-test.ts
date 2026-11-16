// Tes koneksi provider Jenna dari server. Pesan hasil tidak pernah memuat API key atau body vendor
// (kecuali `error.param`/`error.code` pendek dari HTTP 400 OpenAI).
import { ANTHROPIC_VERSION, anthropicMessagesUrl, readErrorBody } from "./provider/common";
import { buildOpenAIChatBody, openAIChatUrl } from "./provider/openai-compatible";
import type { ToolSpec } from "./provider/types";
import { JENNA_VOICE_SLOT, type JennaSlot, type JennaVoiceSlot } from "./types";

export type ConnectionTestConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
  timeoutMs: number;
  /** Dipakai slot chat_openai saja (setelan tersimpan, dikirim seperti chat publik). */
  temperature: number | null;
  reasoningEffort: string | null;
};

export type ConnectionTestResult = { ok: boolean; message: string; latencyMs: number };

export type JennaTestSlot = JennaSlot | JennaVoiceSlot;

const OPENAI_TEST_MAX_TOKENS = 16;

// Jenna selalu mengirim tools, jadi tes ikut mengirim satu tool supaya aturan tools model ikut teruji.
const PING_TOOL: ToolSpec = { name: "ping", description: "Tes koneksi.", parameters: { type: "object", properties: {} } };

function openAIChatTestRequest(cfg: Omit<ConnectionTestConfig, "timeoutMs">): { url: string; init: RequestInit } {
  const body = buildOpenAIChatBody(
    { model: cfg.model, temperature: cfg.temperature, maxTokens: OPENAI_TEST_MAX_TOKENS, reasoningEffort: cfg.reasoningEffort },
    [{ role: "user", content: "ping" }],
    [PING_TOOL],
    false,
  );
  return {
    url: openAIChatUrl(cfg.baseUrl),
    init: {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify(body),
    },
  };
}

export function buildConnectionTestRequest(
  slot: JennaTestSlot,
  cfg: Omit<ConnectionTestConfig, "timeoutMs">,
): { url: string; init: RequestInit } {
  if (slot === "chat_anthropic") {
    return {
      url: anthropicMessagesUrl(cfg.baseUrl),
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": cfg.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({ model: cfg.model, max_tokens: 1, messages: [{ role: "user", content: "ping" }] }),
      },
    };
  }
  if (slot === "chat_openai") return openAIChatTestRequest(cfg);
  return {
    url: `${cfg.baseUrl.replace(/\/+$/, "")}/models`,
    init: { method: "GET", headers: { authorization: `Bearer ${cfg.apiKey}` } },
  };
}

export function describeHttpStatus(status: number): { ok: boolean; message: string } {
  if (status >= 200 && status < 300) return { ok: true, message: `Terhubung (HTTP ${status}).` };
  if (status >= 300 && status < 400) {
    return { ok: false, message: `Provider mengalihkan permintaan (HTTP ${status}). Periksa Base URL.` };
  }
  if (status === 401 || status === 403) return { ok: false, message: `API key ditolak provider (HTTP ${status}).` };
  if (status === 404) return { ok: false, message: "Endpoint atau model tidak ditemukan (HTTP 404). Periksa Base URL dan model." };
  if (status === 429 || status === 529) return { ok: false, message: `Provider sibuk atau kena rate limit (HTTP ${status}).` };
  if (status >= 500) return { ok: false, message: `Provider sedang bermasalah (HTTP ${status}).` };
  return { ok: false, message: `Permintaan ditolak provider (HTTP ${status}). Periksa model dan konfigurasi.` };
}

const VENDOR_TOKEN_PATTERN = /^[A-Za-z0-9_.-]{1,64}$/;

function vendorToken(value: unknown, apiKey: string): string | null {
  if (typeof value !== "string" || !VENDOR_TOKEN_PATTERN.test(value)) return null;
  return apiKey !== "" && value.includes(apiKey) ? null : value;
}

/**
 * HTTP 400 OpenAI-compatible: hanya `error.param` dan `error.code` (token pendek) yang ditampilkan,
 * `error.message` tidak pernah. null = tidak ada yang layak tampil (pakai pesan status biasa).
 */
export function describeOpenAIBadRequest(rawBody: string, apiKey: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    // Body bukan JSON (atau terpotong batas baca): jatuh ke pesan status HTTP biasa.
    return null;
  }
  const error = (parsed as { error?: { param?: unknown; code?: unknown } | null } | null)?.error;
  const param = vendorToken(error?.param, apiKey);
  const code = vendorToken(error?.code, apiKey);
  if (!param && !code) return null;
  const detail = param ? `parameter \`${param}\` ditolak${code ? ` (${code})` : ""}` : `kode galat ${code}`;
  return `Permintaan ditolak provider (HTTP 400): ${detail}. Ubah Reasoning effort atau Temperature.`;
}

/** Gateway suara hanya dicek keterjangkauannya; selain 401/403, respons HTTP apa pun dianggap terjangkau. */
export function describeVoiceHttpStatus(status: number): { ok: boolean; message: string } {
  if (status === 401 || status === 403) return { ok: false, message: `Gateway menolak API key (HTTP ${status}).` };
  return {
    ok: true,
    message: `Gateway terjangkau (HTTP ${status}). Negosiasi suara (SDP) baru teruji saat sesi suara pertama dipakai.`,
  };
}

const NETWORK_CODE_MESSAGES: Record<string, string> = {
  ENOTFOUND: "Host provider tidak ditemukan. Periksa Base URL.",
  EAI_AGAIN: "DNS host provider gagal di-resolve sementara. Coba lagi.",
  ECONNREFUSED: "Koneksi ke provider ditolak.",
  ECONNRESET: "Koneksi ke provider terputus.",
  CERT_HAS_EXPIRED: "Sertifikat TLS provider kedaluwarsa.",
  DEPTH_ZERO_SELF_SIGNED_CERT: "Sertifikat TLS provider tidak tepercaya (self-signed).",
  ERR_TLS_CERT_ALTNAME_INVALID: "Sertifikat TLS tidak cocok dengan host Base URL.",
};

export function describeFetchError(err: unknown): string {
  if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
    return "Koneksi melewati batas waktu (timeout).";
  }
  const code = (err as { cause?: { code?: unknown } } | null)?.cause?.code;
  if (typeof code === "string" && NETWORK_CODE_MESSAGES[code]) return NETWORK_CODE_MESSAGES[code];
  return "Tidak dapat terhubung ke provider. Periksa Base URL dan jaringan server.";
}

export async function runConnectionTest(
  slot: JennaTestSlot,
  cfg: ConnectionTestConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ConnectionTestResult> {
  const { url, init } = buildConnectionTestRequest(slot, cfg);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  const started = Date.now();
  try {
    const res = await fetchImpl(url, { ...init, redirect: "manual", signal: controller.signal, cache: "no-store" });
    let badRequest: string | null = null;
    if (slot === "chat_openai" && res.status === 400) {
      badRequest = describeOpenAIBadRequest(await readErrorBody(res), cfg.apiKey);
    } else {
      // Body vendor sengaja dibuang (bisa memuat detail akun); cukup status. Gagal cancel
      // stream tidak memengaruhi hasil tes, jadi diabaikan.
      await res.body?.cancel().catch(() => undefined);
    }
    const outcome = badRequest
      ? { ok: false, message: badRequest }
      : slot === JENNA_VOICE_SLOT
        ? describeVoiceHttpStatus(res.status)
        : describeHttpStatus(res.status);
    return { ...outcome, latencyMs: Date.now() - started };
  } catch (err) {
    return { ok: false, message: describeFetchError(err), latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
