// Tes koneksi provider Jenna dari server. Pesan hasil tidak pernah memuat API key atau body vendor.
import { ANTHROPIC_VERSION, anthropicMessagesUrl } from "./provider/common";
import type { JennaSlot } from "./types";

export type ConnectionTestConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
  timeoutMs: number;
};

export type ConnectionTestResult = { ok: boolean; message: string; latencyMs: number };

export function buildConnectionTestRequest(
  slot: JennaSlot,
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
  slot: JennaSlot,
  cfg: ConnectionTestConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ConnectionTestResult> {
  const { url, init } = buildConnectionTestRequest(slot, cfg);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  const started = Date.now();
  try {
    const res = await fetchImpl(url, { ...init, redirect: "manual", signal: controller.signal, cache: "no-store" });
    // Body vendor sengaja dibuang (bisa memuat detail akun); cukup status. Gagal cancel
    // stream tidak memengaruhi hasil tes, jadi diabaikan.
    await res.body?.cancel().catch(() => undefined);
    return { ...describeHttpStatus(res.status), latencyMs: Date.now() - started };
  } catch (err) {
    return { ok: false, message: describeFetchError(err), latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
