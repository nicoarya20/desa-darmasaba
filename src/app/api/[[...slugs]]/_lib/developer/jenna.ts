import type { Context } from "elysia";
import {
  clearJennaProviderKey,
  getJennaConfig,
  testJennaProvider,
  updateJennaProvider,
  updateJennaSettings,
} from "@/lib/jenna/service";
import { env } from "@/lib/env";
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
  await updateJennaSettings(guard.user.id, parsed.value);
  return { success: true, data: await getJennaConfig() };
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
