import type { Context } from "elysia";
import {
  clearJennaVoiceProviderKey,
  getJennaConfig,
  testJennaVoiceProvider,
  updateJennaVoiceProvider,
} from "@/lib/jenna/service";
import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import { env } from "@/lib/env";
import {
  JENNA_VOICE_SLOT,
  type ApiResult,
  type JennaConfigResponse,
  type JennaVoiceProviderTestResponse,
  type JennaVoiceProviderUpdateInput,
} from "@/lib/jenna/types";
import { validateVoiceProviderInput } from "@/lib/jenna/validation";
import { requireDeveloper } from "./guard";
import { providerAuditMeta } from "./jenna";

export async function jennaVoiceProviderUpdate(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = validateVoiceProviderInput(context.body as JennaVoiceProviderUpdateInput, env.NODE_ENV);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  const saved = await updateJennaVoiceProvider(guard.user.id, parsed.value);
  if (!saved.ok) {
    context.set.status = saved.status;
    return { success: false, message: saved.message };
  }
  await audit({
    actor: guard.user,
    action: AUDIT_ACTIONS.JENNA_VOICE_PROVIDER_UPDATE,
    targetType: "jenna_provider",
    targetId: JENNA_VOICE_SLOT,
    summary: "Menyimpan konfigurasi provider suara Jenna",
    meta: providerAuditMeta(JENNA_VOICE_SLOT, parsed.value),
  });
  return { success: true, data: await getJennaConfig() };
}

export async function jennaVoiceProviderKeyDelete(context: Context): Promise<ApiResult<JennaConfigResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  await clearJennaVoiceProviderKey(guard.user.id);
  console.info(`[jenna] API key provider voice dihapus oleh developer ${guard.user.id}`);
  await audit({
    actor: guard.user,
    action: AUDIT_ACTIONS.JENNA_VOICE_PROVIDER_KEY_DELETE,
    targetType: "jenna_provider",
    targetId: JENNA_VOICE_SLOT,
    summary: "Menghapus API key provider suara Jenna",
    meta: { slot: JENNA_VOICE_SLOT },
  });
  return { success: true, data: await getJennaConfig() };
}

export async function jennaVoiceProviderTest(context: Context): Promise<ApiResult<JennaVoiceProviderTestResponse>> {
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const result = await testJennaVoiceProvider();
  if (!result) {
    context.set.status = 400;
    return {
      success: false,
      message: "Provider suara belum disimpan. Simpan konfigurasi provider suara terlebih dahulu.",
    };
  }
  return { success: true, data: result };
}
