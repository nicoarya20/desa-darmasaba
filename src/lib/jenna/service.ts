// Akses DB setelan Jenna (server-only). Validasi input dilakukan di validation.ts sebelum masuk sini.
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { runConnectionTest, type ConnectionTestResult, type JennaTestSlot } from "./connection-test";
import { apiKeyHint, decryptSecret, encryptSecret, isCredentialsKeyValid } from "./crypto";
import { JENNA_SETTINGS_ID, toProviderDTO, toProviderDTOs, toSettingsDTO, toVoiceProviderDTO } from "./mappers";
import { invalidateJennaRuntimeCache } from "./provider/active";
import {
  JENNA_PROTOCOL_SLOT,
  JENNA_VOICE_SLOT,
  type JennaConfigResponse,
  type JennaProviderTestResponse,
  type JennaSettingsUpdateInput,
  type JennaSlot,
  type JennaVoiceProviderTestResponse,
} from "./types";
import { validateBaseUrl, type ProviderUpdateValue, type VoiceProviderUpdateValue } from "./validation";
import type { JennaProvider } from "@prisma/client";

export const CRYPTO_NOT_CONFIGURED_MESSAGE =
  "JENNA_CREDENTIALS_KEY belum diset atau tidak valid di server, API key tidak bisa disimpan. Hubungi pengelola server.";

export function isJennaCryptoConfigured(): boolean {
  return isCredentialsKeyValid(env.JENNA_CREDENTIALS_KEY);
}

export async function getJennaConfig(): Promise<JennaConfigResponse> {
  const [settings, providers] = await Promise.all([
    prisma.jennaSettings.findUnique({
      where: { id: JENNA_SETTINGS_ID },
      include: { updatedBy: { select: { id: true, username: true, email: true } } },
    }),
    prisma.jennaProvider.findMany(),
  ]);
  return {
    settings: toSettingsDTO(settings),
    providers: toProviderDTOs(providers),
    voiceProvider: toVoiceProviderDTO(providers.find((p) => p.slot === JENNA_VOICE_SLOT) ?? null),
    cryptoConfigured: isJennaCryptoConfigured(),
    updatedBy:
      settings?.updatedBy != null
        ? {
            id: settings.updatedBy.id,
            name: settings.updatedBy.username,
            email: settings.updatedBy.email,
            at: settings.updatedAt.toISOString(),
          }
        : null,
  };
}

export async function updateJennaSettings(userId: string, value: JennaSettingsUpdateInput): Promise<void> {
  await prisma.jennaSettings.upsert({
    where: { id: JENNA_SETTINGS_ID },
    create: { id: JENNA_SETTINGS_ID, ...value, updatedById: userId },
    update: { ...value, updatedById: userId },
  });
  invalidateJennaRuntimeCache();
}

export type ProviderUpdateResult = { ok: true } | { ok: false; status: number; message: string };

/** Simpan provider; apiKey null = pertahankan kunci lama. Hasil tes selalu di-reset karena konfigurasi berubah. */
export function updateJennaProvider(
  userId: string,
  slot: JennaSlot,
  value: ProviderUpdateValue,
): Promise<ProviderUpdateResult> {
  return saveProvider(userId, slot, value);
}

/** Provider suara tidak memakai temperature/maxTokens. */
export function updateJennaVoiceProvider(userId: string, value: VoiceProviderUpdateValue): Promise<ProviderUpdateResult> {
  return saveProvider(userId, JENNA_VOICE_SLOT, { ...value, temperature: null, maxTokens: null });
}

async function saveProvider(
  userId: string,
  slot: JennaTestSlot,
  value: ProviderUpdateValue,
): Promise<ProviderUpdateResult> {
  let keyFields: { apiKeyEnc: string; apiKeyHint: string | null } | Record<string, never> = {};
  if (value.apiKey) {
    if (!isJennaCryptoConfigured()) return { ok: false, status: 400, message: CRYPTO_NOT_CONFIGURED_MESSAGE };
    keyFields = {
      apiKeyEnc: encryptSecret(value.apiKey, env.JENNA_CREDENTIALS_KEY),
      apiKeyHint: apiKeyHint(value.apiKey),
    };
  }
  const data = {
    baseUrl: value.baseUrl,
    model: value.model,
    temperature: value.temperature,
    maxTokens: value.maxTokens,
    timeoutMs: value.timeoutMs,
    ...keyFields,
    lastTestAt: null,
    lastTestOk: null,
    lastTestMessage: null,
    updatedById: userId,
  };
  await prisma.jennaProvider.upsert({ where: { slot }, create: { slot, ...data }, update: data });
  invalidateJennaRuntimeCache();
  return { ok: true };
}

/** Hapus API key tersimpan + hasil tes; Base URL dan model tetap. Idempoten: slot tanpa row/key tetap sukses. */
export function clearJennaProviderKey(userId: string, slot: JennaSlot): Promise<void> {
  return clearProviderKey(userId, slot);
}

export function clearJennaVoiceProviderKey(userId: string): Promise<void> {
  return clearProviderKey(userId, JENNA_VOICE_SLOT);
}

async function clearProviderKey(userId: string, slot: JennaTestSlot): Promise<void> {
  await prisma.jennaProvider.updateMany({
    where: { slot },
    data: {
      apiKeyEnc: null,
      apiKeyHint: null,
      lastTestAt: null,
      lastTestOk: null,
      lastTestMessage: null,
      updatedById: userId,
    },
  });
  invalidateJennaRuntimeCache();
}

const INCOMPLETE_MESSAGE: Record<"chat" | "voice", string> = {
  chat: "Provider belum lengkap. Isi Base URL, model, dan API key terlebih dahulu.",
  voice: "Provider suara belum lengkap. Isi Base URL, model, dan API key terlebih dahulu.",
};

async function resolveTestOutcome(
  row: { baseUrl: string; model: string; apiKeyEnc: string | null; timeoutMs: number },
  slot: JennaTestSlot,
): Promise<ConnectionTestResult> {
  if (!row.baseUrl || !row.model || !row.apiKeyEnc) {
    return { ok: false, message: INCOMPLETE_MESSAGE[slot === JENNA_VOICE_SLOT ? "voice" : "chat"], latencyMs: 0 };
  }
  // Validasi ulang: aturan bisa lebih ketat dari saat disimpan (mis. http localhost lalu pindah ke production).
  const baseUrl = validateBaseUrl(row.baseUrl, env.NODE_ENV);
  if (!baseUrl.ok) return { ok: false, message: baseUrl.error, latencyMs: 0 };
  if (!isJennaCryptoConfigured()) return { ok: false, message: CRYPTO_NOT_CONFIGURED_MESSAGE, latencyMs: 0 };

  let apiKey: string;
  try {
    apiKey = decryptSecret(row.apiKeyEnc, env.JENNA_CREDENTIALS_KEY);
  } catch {
    return {
      ok: false,
      message: "API key tersimpan tidak bisa dibaca (kunci enkripsi berubah atau data rusak). Isi ulang API key.",
      latencyMs: 0,
    };
  }
  return runConnectionTest(slot, { baseUrl: baseUrl.value, model: row.model, apiKey, timeoutMs: row.timeoutMs });
}

type StoredTestResult = ConnectionTestResult & { testedAt: string; row: JennaProvider };

/** Tes koneksi memakai konfigurasi & key TERSIMPAN; hasil disimpan ke row. null = slot belum pernah disimpan. */
async function runStoredTest(slot: JennaTestSlot): Promise<StoredTestResult | null> {
  const row = await prisma.jennaProvider.findUnique({ where: { slot } });
  if (!row) return null;

  const outcome = await resolveTestOutcome(row, slot);
  const testedAt = new Date();
  const updated = await prisma.jennaProvider.update({
    where: { slot },
    data: { lastTestAt: testedAt, lastTestOk: outcome.ok, lastTestMessage: outcome.message },
  });
  return { ...outcome, testedAt: testedAt.toISOString(), row: updated };
}

export async function testJennaProvider(slot: JennaSlot): Promise<JennaProviderTestResponse | null> {
  const result = await runStoredTest(slot);
  if (!result) return null;
  const { row, ...outcome } = result;
  return { ...outcome, provider: toProviderDTO(slot, row) };
}

export async function testJennaVoiceProvider(): Promise<JennaVoiceProviderTestResponse | null> {
  const result = await runStoredTest(JENNA_VOICE_SLOT);
  if (!result) return null;
  const { row, ...outcome } = result;
  return { ...outcome, provider: toVoiceProviderDTO(row) };
}

/** Ringkasan kesiapan Jenna untuk halaman Ringkasan Sistem. */
export async function getJennaReadiness(): Promise<{ cryptoConfigured: boolean; enabled: boolean; ready: boolean }> {
  const config = await getJennaConfig();
  const activeSlot = JENNA_PROTOCOL_SLOT[config.settings.chatProtocol];
  const active = config.providers.find((p) => p.slot === activeSlot);
  return {
    cryptoConfigured: config.cryptoConfigured,
    enabled: config.settings.enabled,
    ready: config.cryptoConfigured && Boolean(active?.ready),
  };
}
