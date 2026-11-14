import type { Context } from "elysia";
import { getUsage, listErrorLog } from "@/lib/jenna/chat/usage-admin.repo";
import type { ApiResult } from "@/lib/jenna/types";
import type { JennaErrorLogResponse, JennaUsageResponse } from "@/lib/jenna/usage-types";
import { parseErrorLogQuery } from "@/lib/jenna/validation";
import { requireDeveloper } from "./guard";
import { noStore } from "./jenna-conversations";

/** Pemakaian Jenna 24 jam & 7 hari terakhir (jendela bergulir). */
export async function jennaUsageGet(context: Context): Promise<ApiResult<JennaUsageResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  return { success: true, data: await getUsage(new Date()) };
}

/** Log giliran gagal beserta penyebab aslinya (sudah disanitasi saat disimpan). */
export async function jennaErrorsList(context: Context): Promise<ApiResult<JennaErrorLogResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = parseErrorLogQuery(context.query as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  return { success: true, data: await listErrorLog(parsed.value, new Date()) };
}
