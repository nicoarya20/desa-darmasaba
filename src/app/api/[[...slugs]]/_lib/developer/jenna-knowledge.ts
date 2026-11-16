import type { Context } from "elysia";
import { buildJennaKnowledge } from "@/lib/jenna/knowledge/admin";
import type { JennaKnowledgeResponse } from "@/lib/jenna/knowledge-types";
import type { ApiResult } from "@/lib/jenna/types";
import { requireDeveloper } from "./guard";

/** Pengetahuan Jenna (read-only): snapshot segar, sumber registry, dan tool. */
export async function jennaKnowledgeGet(context: Context): Promise<ApiResult<JennaKnowledgeResponse>> {
  context.set.headers["cache-control"] = "no-store";
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;
  return { success: true, data: await buildJennaKnowledge() };
}
