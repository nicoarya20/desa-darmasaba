// Akses DB setelan Jenna (server-only). Validasi input dilakukan di validation.ts sebelum masuk sini.
import prisma from "@/lib/prisma";
import { env } from "@/lib/env";
import { runConnectionTest } from "./connection-test";
import { apiKeyHint, decryptSecret, encryptSecret, isCredentialsKeyValid } from "./crypto";
import { JENNA_SETTINGS_ID, toProviderDTO, toProviderDTOs, toSettingsDTO } from "./mappers";
import { JENNA_PROTOCOL_SLOT, type JennaConfigResponse, type JennaProviderTestResponse, type JennaSettingsUpdateInput, type JennaSlot } from "./types";
import { validateBaseUrl, type ProviderUpdateValue } from "./validation";

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
}

export type ProviderUpdateResult = { ok: true } | { ok: false; status: number; message: string };

/** Simpan provider; apiKey null = pertahankan kunci lama. Hasil tes selalu di-reset karena konfigurasi berubah. */
export async function updateJennaProvider(
  userId: string,
  slot: JennaSlot,
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
  return { ok: true };
}

async function resolveTestOutcome(
  row: { baseUrl: string; model: string; apiKeyEnc: string | null; timeoutMs: number },
  slot: JennaSlot,
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  if (!row.baseUrl || !row.model || !row.apiKeyEnc) {
    return { ok: false, message: "Provider belum lengkap. Isi Base URL, model, dan API key terlebih dahulu.", latencyMs: 0 };
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

/** Tes koneksi memakai konfigurasi & key TERSIMPAN; hasil disimpan ke row. null = slot belum pernah disimpan. */
export async function testJennaProvider(slot: JennaSlot): Promise<JennaProviderTestResponse | null> {
  const row = await prisma.jennaProvider.findUnique({ where: { slot } });
  if (!row) return null;

  const outcome = await resolveTestOutcome(row, slot);
  const testedAt = new Date();
  const updated = await prisma.jennaProvider.update({
    where: { slot },
    data: { lastTestAt: testedAt, lastTestOk: outcome.ok, lastTestMessage: outcome.message },
  });
  return { ...outcome, testedAt: testedAt.toISOString(), provider: toProviderDTO(slot, updated) };
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
