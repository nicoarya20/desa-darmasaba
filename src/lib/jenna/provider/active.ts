// Provider aktif untuk runtime publik (server-only): chat dari slot `chatProtocol`, suara dari slot "voice".
// baseUrl divalidasi ulang, API key didekripsi. Di-cache 30 detik agar tidak query DB per pesan/heartbeat.
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import type { JennaProvider } from "@prisma/client";
import { decryptSecret, SecretCryptoError } from "../crypto";
import { JENNA_SETTINGS_ID, toSettingsDTO } from "../mappers";
import { JENNA_PROTOCOL_SLOT, JENNA_VOICE_SLOT, type JennaSettingsDTO, type JennaSlot } from "../types";
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

/** Kredensial gateway suara (server-only; apiKey tidak pernah ke klien atau log). */
export type ActiveVoiceProvider = { baseUrl: string; apiKey: string; model: string } | { notReady: JennaNotReadyReason };

/** Ketersediaan chat publik: rumus tunggal untuk /api/jenna/status dan gerbang suara. */
export function chatAvailability(active: ActiveJennaProvider): "ok" | "disabled" | "not_ready" {
  if (!active.settings.enabled) return "disabled";
  // Readiness publik mewajibkan budget token harian > 0.
  if ("notReady" in active || active.settings.dailyTokensGlobal <= 0) return "not_ready";
  return "ok";
}

type CacheSlot<T> = { entry?: { value: T; expiresAt: number }; pending?: Promise<T> };
type CacheState = { generation: number; chat: CacheSlot<ActiveJennaProvider>; voice: CacheSlot<ActiveVoiceProvider> };

// globalThis: satu cache per proses, tidak ter-reset oleh HMR dev.
const globalCache = globalThis as typeof globalThis & { __jennaRuntimeCaches?: CacheState };
const cache = (globalCache.__jennaRuntimeCaches ??= { generation: 0, chat: {}, voice: {} });

/** Dipanggil setelah setelan/provider Jenna disimpan. */
export function invalidateJennaRuntimeCache(): void {
  cache.generation += 1;
  cache.chat = {};
  cache.voice = {};
}

function cachedLoad<T>(key: "chat" | "voice", load: () => Promise<T>, now: number): Promise<T> {
  const slot = cache[key] as CacheSlot<T>;
  if (slot.entry && slot.entry.expiresAt > now) return Promise.resolve(slot.entry.value);
  if (slot.pending) return slot.pending;

  const generation = cache.generation;
  const pending = load().then(
    (value) => {
      // Hasil muat yang dimulai sebelum invalidate tidak boleh menimpa cache baru.
      if (cache.generation === generation) {
        slot.entry = { value, expiresAt: now + JENNA_RUNTIME_CACHE_TTL_MS };
        slot.pending = undefined;
      }
      return value;
    },
    (err: unknown) => {
      if (cache.generation === generation) slot.pending = undefined;
      throw err;
    },
  );
  slot.pending = pending;
  return pending;
}

/** baseUrl tervalidasi + API key terdekripsi dari row provider, atau alasan belum siap. */
function readCredentials(
  row: JennaProvider | null,
): { baseUrl: string; apiKey: string; model: string } | { notReady: JennaNotReadyReason } {
  if (!row || !row.baseUrl || !row.model || !row.apiKeyEnc) return { notReady: "not_configured" };

  // Validasi ulang seperti testJennaProvider: aturan bisa lebih ketat dari saat disimpan.
  const baseUrl = validateBaseUrl(row.baseUrl, env.NODE_ENV);
  if (!baseUrl.ok) return { notReady: "invalid_base_url" };

  try {
    return { baseUrl: baseUrl.value, apiKey: decryptSecret(row.apiKeyEnc, env.JENNA_CREDENTIALS_KEY), model: row.model };
  } catch (err) {
    const keyProblem = err instanceof SecretCryptoError && (err.code === "KEY_MISSING" || err.code === "KEY_INVALID");
    return { notReady: keyProblem ? "crypto_not_configured" : "decrypt_failed" };
  }
}

async function loadActiveProvider(): Promise<ActiveJennaProvider> {
  const settings = toSettingsDTO(await prisma.jennaSettings.findUnique({ where: { id: JENNA_SETTINGS_ID } }));
  const slot = JENNA_PROTOCOL_SLOT[settings.chatProtocol];
  const row = await prisma.jennaProvider.findUnique({ where: { slot } });
  const creds = readCredentials(row);
  if ("notReady" in creds || !row) return { notReady: "notReady" in creds ? creds.notReady : "not_configured", settings };

  const provider = createTextProvider(settings.chatProtocol, {
    baseUrl: creds.baseUrl,
    apiKey: creds.apiKey,
    model: creds.model,
    temperature: row.temperature,
    maxTokens: row.maxTokens,
    timeoutMs: row.timeoutMs,
  });
  return { provider, settings, slot, model: creds.model };
}

export function resolveActiveProvider(now: number = Date.now()): Promise<ActiveJennaProvider> {
  return cachedLoad("chat", loadActiveProvider, now);
}

/** Kredensial hanya dari slot suara; tidak pernah jatuh ke provider teks. */
export function resolveVoiceProvider(now: number = Date.now()): Promise<ActiveVoiceProvider> {
  return cachedLoad(
    "voice",
    async () => readCredentials(await prisma.jennaProvider.findUnique({ where: { slot: JENNA_VOICE_SLOT } })),
    now,
  );
}
