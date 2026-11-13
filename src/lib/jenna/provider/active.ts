// Provider aktif untuk runtime chat publik (server-only): slot dari `chatProtocol`, baseUrl divalidasi
// ulang, API key didekripsi. Di-cache 30 detik agar tidak query DB per pesan.
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { decryptSecret, SecretCryptoError } from "../crypto";
import { JENNA_SETTINGS_ID, toSettingsDTO } from "../mappers";
import { JENNA_PROTOCOL_SLOT, type JennaSettingsDTO, type JennaSlot } from "../types";
import { validateBaseUrl } from "../validation";
import { createTextProvider } from "./resolve";
import type { AIProvider } from "./types";

export const JENNA_RUNTIME_CACHE_TTL_MS = 30_000;

/**
 * `not_configured` = row slot tidak ada / baseUrl, model, atau API key kosong;
 * `invalid_base_url` = baseUrl tersimpan tidak lolos aturan saat ini (mis. http di production);
 * `crypto_not_configured` = JENNA_CREDENTIALS_KEY kosong/tidak valid; `decrypt_failed` = data/kunci tidak cocok.
 */
export type JennaNotReadyReason = "not_configured" | "invalid_base_url" | "crypto_not_configured" | "decrypt_failed";

/** `settings` selalu ada (termasuk `enabled`), juga saat provider belum siap. */
export type ActiveJennaProvider =
  | { provider: AIProvider; settings: JennaSettingsDTO; slot: JennaSlot; model: string }
  | { notReady: JennaNotReadyReason; settings: JennaSettingsDTO };

type CacheState = {
  generation: number;
  entry?: { value: ActiveJennaProvider; expiresAt: number };
  pending?: Promise<ActiveJennaProvider>;
};

// globalThis: satu cache per proses, tidak ter-reset oleh HMR dev.
const globalCache = globalThis as typeof globalThis & { __jennaRuntimeCache?: CacheState };
const cache = (globalCache.__jennaRuntimeCache ??= { generation: 0 });

/** Dipanggil setelah setelan/provider Jenna disimpan. */
export function invalidateJennaRuntimeCache(): void {
  cache.generation += 1;
  cache.entry = undefined;
  cache.pending = undefined;
}

async function loadActiveProvider(): Promise<ActiveJennaProvider> {
  const settings = toSettingsDTO(await prisma.jennaSettings.findUnique({ where: { id: JENNA_SETTINGS_ID } }));
  const slot = JENNA_PROTOCOL_SLOT[settings.chatProtocol];
  const row = await prisma.jennaProvider.findUnique({ where: { slot } });
  if (!row || !row.baseUrl || !row.model || !row.apiKeyEnc) return { notReady: "not_configured", settings };

  // Validasi ulang seperti testJennaProvider: aturan bisa lebih ketat dari saat disimpan.
  const baseUrl = validateBaseUrl(row.baseUrl, env.NODE_ENV);
  if (!baseUrl.ok) return { notReady: "invalid_base_url", settings };

  let apiKey: string;
  try {
    apiKey = decryptSecret(row.apiKeyEnc, env.JENNA_CREDENTIALS_KEY);
  } catch (err) {
    const keyProblem = err instanceof SecretCryptoError && (err.code === "KEY_MISSING" || err.code === "KEY_INVALID");
    return { notReady: keyProblem ? "crypto_not_configured" : "decrypt_failed", settings };
  }

  const provider = createTextProvider(settings.chatProtocol, {
    baseUrl: baseUrl.value,
    apiKey,
    model: row.model,
    temperature: row.temperature,
    maxTokens: row.maxTokens,
    timeoutMs: row.timeoutMs,
  });
  return { provider, settings, slot, model: row.model };
}

export async function resolveActiveProvider(now: number = Date.now()): Promise<ActiveJennaProvider> {
  if (cache.entry && cache.entry.expiresAt > now) return cache.entry.value;
  if (cache.pending) return cache.pending;

  const generation = cache.generation;
  const pending = loadActiveProvider().then(
    (value) => {
      // Hasil muat yang dimulai sebelum invalidate tidak boleh menimpa cache baru.
      if (cache.generation === generation) {
        cache.entry = { value, expiresAt: now + JENNA_RUNTIME_CACHE_TTL_MS };
        cache.pending = undefined;
      }
      return value;
    },
    (err: unknown) => {
      if (cache.generation === generation) cache.pending = undefined;
      throw err;
    },
  );
  cache.pending = pending;
  return pending;
}
