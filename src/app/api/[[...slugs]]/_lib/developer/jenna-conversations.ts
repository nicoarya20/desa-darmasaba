import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import type {
  JennaConversationDeleteResponse,
  JennaConversationDetail,
  JennaConversationListResponse,
  JennaStatsResponse,
} from "@/lib/jenna/admin-types";
import {
  countConversations,
  deleteConversation,
  getConversationDetail,
  listConversations,
  messageStatsSince,
} from "@/lib/jenna/chat/conversation-admin.repo";
import { startOfJakartaDay } from "@/lib/jenna/limits";
import { JENNA_SETTINGS_ID, toSettingsDTO } from "@/lib/jenna/mappers";
import type { ApiResult } from "@/lib/jenna/types";
import { isJennaConversationId, parseConversationListQuery } from "@/lib/jenna/validation";
import { requireDeveloper } from "./guard";

const NOT_FOUND = "Percakapan tidak ditemukan.";
const INVALID_ID = "ID percakapan tidak valid.";

// Isi percakapan warga: jangan pernah di-cache browser/proxy.
export function noStore(context: Pick<Context, "set">) {
  context.set.headers["cache-control"] = "no-store";
}

export async function jennaStatsGet(context: Context): Promise<ApiResult<JennaStatsResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const now = new Date();
  const since = startOfJakartaDay(now);
  const [today, conversationsStored, settingsRow] = await Promise.all([
    messageStatsSince(since),
    countConversations(),
    prisma.jennaSettings.findUnique({ where: { id: JENNA_SETTINGS_ID } }),
  ]);
  const settings = toSettingsDTO(settingsRow);
  return {
    success: true,
    data: {
      today: { since: since.toISOString(), ...today },
      dailyTokensGlobal: settings.dailyTokensGlobal,
      conversationsStored,
      retentionDays: settings.retentionDays,
      generatedAt: now.toISOString(),
    },
  };
}

export async function jennaConversationsList(context: Context): Promise<ApiResult<JennaConversationListResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = parseConversationListQuery(context.query as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  return { success: true, data: await listConversations(parsed.value) };
}

export async function jennaConversationGet(context: Context): Promise<ApiResult<JennaConversationDetail>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const { id } = context.params as { id?: unknown };
  if (!isJennaConversationId(id)) {
    context.set.status = 400;
    return { success: false, message: INVALID_ID };
  }
  const detail = await getConversationDetail(id);
  if (!detail) {
    context.set.status = 404;
    return { success: false, message: NOT_FOUND };
  }
  return { success: true, data: detail };
}

export async function jennaConversationDelete(context: Context): Promise<ApiResult<JennaConversationDeleteResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const { id } = context.params as { id?: unknown };
  if (!isJennaConversationId(id)) {
    context.set.status = 400;
    return { success: false, message: INVALID_ID };
  }
  if (!(await deleteConversation(id))) {
    context.set.status = 404;
    return { success: false, message: NOT_FOUND };
  }
  console.info(`[jenna] Percakapan ${id} dihapus oleh developer ${guard.user.id}`);
  return { success: true, data: { id } };
}
