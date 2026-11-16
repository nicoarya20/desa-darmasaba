import type { Context } from "elysia";
import {
  clearJennaProviderKey,
  getJennaConfig,
  testJennaProvider,
  updateJennaProvider,
  updateJennaSettings,
} from "@/lib/jenna/service";
import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import { env } from "@/lib/env";
import { JENNA_SETTINGS_ID, toSettingsDTO } from "@/lib/jenna/mappers";
import prisma from "@/lib/prisma";
import type {
  ApiResult,
  JennaConfigResponse,
  JennaProviderTestResponse,
  JennaProviderUpdateInput,
  JennaSettingsUpdateInput,
} from "@/lib/jenna/types";
import { isJennaSlot, validateProviderInput, validateSettingsInput } from "@/lib/jenna/validation";
import { requireDeveloper } from "./guard";

const UNKNOWN_SLOT = (slot: string) => `Slot provider tidak dikenal: ${slot}`;

/** Meta audit simpan provider: host Base URL saja, API key tidak pernah dicatat. */
export function providerAuditMeta(slot: string, value: { baseUrl: string; model: string; apiKey: string | null }) {
  return { slot, model: value.model, baseUrlHost: new URL(value.baseUrl).host, apiKeyChanged: value.apiKey !== null };
}

export async function jennaConfigGet(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;
  return { success: true, data: await getJennaConfig() };
}

export async function jennaSettingsUpdate(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = validateSettingsInput(context.body as JennaSettingsUpdateInput);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  const before = toSettingsDTO(await prisma.jennaSettings.findUnique({ where: { id: JENNA_SETTINGS_ID } }));
  await updateJennaSettings(guard.user.id, parsed.value);
  const config = await getJennaConfig();
  // Nama field saja: personaNote berisi teks bebas.
  const fields = (Object.keys(parsed.value) as (keyof JennaSettingsUpdateInput)[]).filter(
    (field) => before[field] !== config.settings[field],
  );
  await audit({
    actor: guard.user,
    action: AUDIT_ACTIONS.JENNA_SETTINGS_UPDATE,
    targetType: "jenna_settings",
    targetId: JENNA_SETTINGS_ID,
    summary: `Mengubah pengaturan Jenna (${fields.length} field berubah)`,
    meta: { fields },
  });
  return { success: true, data: config };
}

export async function jennaProviderUpdate(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const { slot } = context.params as { slot: string };
  if (!isJennaSlot(slot)) {
    context.set.status = 404;
    return { success: false, message: UNKNOWN_SLOT(slot) };
  }
  const parsed = validateProviderInput(context.body as JennaProviderUpdateInput, env.NODE_ENV);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  const saved = await updateJennaProvider(guard.user.id, slot, parsed.value);
  if (!saved.ok) {
    context.set.status = saved.status;
    return { success: false, message: saved.message };
  }
  await audit({
    actor: guard.user,
    action: AUDIT_ACTIONS.JENNA_PROVIDER_UPDATE,
    targetType: "jenna_provider",
    targetId: slot,
    summary: `Menyimpan konfigurasi provider Jenna ${slot}`,
    meta: providerAuditMeta(slot, parsed.value),
  });
  return { success: true, data: await getJennaConfig() };
}

export async function jennaProviderKeyDelete(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const { slot } = context.params as { slot: string };
  if (!isJennaSlot(slot)) {
    context.set.status = 404;
    return { success: false, message: UNKNOWN_SLOT(slot) };
  }
  await clearJennaProviderKey(guard.user.id, slot);
  console.info(`[jenna] API key provider ${slot} dihapus oleh developer ${guard.user.id}`);
  await audit({
    actor: guard.user,
    action: AUDIT_ACTIONS.JENNA_PROVIDER_KEY_DELETE,
    targetType: "jenna_provider",
    targetId: slot,
    summary: `Menghapus API key provider Jenna ${slot}`,
    meta: { slot },
  });
  return { success: true, data: await getJennaConfig() };
}

export async function jennaProviderTest(context: Context): Promise<ApiResult<JennaProviderTestResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const { slot } = context.params as { slot: string };
  if (!isJennaSlot(slot)) {
    context.set.status = 404;
    return { success: false, message: UNKNOWN_SLOT(slot) };
  }
  const result = await testJennaProvider(slot);
  if (!result) {
    context.set.status = 400;
    return { success: false, message: "Provider belum disimpan. Simpan konfigurasi provider terlebih dahulu." };
  }
  return { success: true, data: result };
}
