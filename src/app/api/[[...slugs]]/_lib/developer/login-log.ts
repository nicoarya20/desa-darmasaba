import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import type { ApiResult } from "@/lib/jenna/types";
import type { ValidationResult } from "@/lib/jenna/validation";
import { LOGIN_LOG_RESULTS, type LoginLogResult } from "@/lib/login-log";
import prisma from "@/lib/prisma";
import { createdAtRange, isLogId, parseLogQuery, parseOptionalParam, type LogQuery } from "./audit-log";
import { requireDeveloper } from "./guard";
import { noStore } from "./jenna-conversations";

// Log Login hanya dibaca di sini; penghapusan otomatis 90 hari ada di src/lib/login-log.ts.

const HOUR_MS = 3_600_000;
const RESULT_VALUES: readonly string[] = LOGIN_LOG_RESULTS;
const isLoginLogResult = (v: string): v is LoginLogResult => RESULT_VALUES.includes(v);
const BLOCKED: LoginLogResult = "blocked_inactive";

export type LoginLogQuery = LogQuery & { result: LoginLogResult | null; userId: string | null };

export function parseLoginLogQuery(query: Record<string, unknown> | undefined): ValidationResult<LoginLogQuery> {
  const base = parseLogQuery(query);
  if (!base.ok) return base;
  const { result: rawResult, userId: rawUserId } = query ?? {};

  const result = parseOptionalParam(
    rawResult,
    isLoginLogResult,
    `Parameter result harus salah satu dari ${LOGIN_LOG_RESULTS.join(", ")}.`,
  );
  if (!result.ok) return result;
  const userId = parseOptionalParam(rawUserId, isLogId, "Parameter userId tidak valid.");
  if (!userId.ok) return userId;

  return { ok: true, value: { ...base.value, result: result.value as LoginLogResult | null, userId: userId.value } };
}

export function loginLogWhere(query: Omit<LoginLogQuery, "page" | "limit">): Prisma.LoginLogWhereInput {
  const where: Prisma.LoginLogWhereInput = {};
  if (query.result) where.result = query.result;
  if (query.userId) where.userId = query.userId;
  const createdAt = createdAtRange(query.from, query.to);
  if (createdAt) where.createdAt = createdAt;
  if (query.q) {
    const contains = { contains: query.q, mode: "insensitive" as const };
    where.OR = [{ email: contains }, { ipAddress: contains }];
  }
  return where;
}

export type LoginLogItem = {
  id: string;
  /** ISO string. */
  createdAt: string;
  userId: string | null;
  email: string | null;
  roleId: string | null;
  result: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type LoginLogStats = { last24h: number; last7d: number; blocked7d: number; uniqueUsers7d: number };

export type LoginLogListResponse = {
  items: LoginLogItem[];
  page: number;
  limit: number;
  total: number;
  /** Selalu seluruh log (tidak terpengaruh filter). */
  stats: LoginLogStats;
};

export const LOGIN_LOG_SELECT = {
  id: true,
  createdAt: true,
  userId: true,
  email: true,
  roleId: true,
  result: true,
  ipAddress: true,
  userAgent: true,
} satisfies Prisma.LoginLogSelect;

async function loginLogStats(now: Date): Promise<LoginLogStats> {
  const since24h = new Date(now.getTime() - 24 * HOUR_MS);
  const since7d = new Date(now.getTime() - 7 * 24 * HOUR_MS);
  const [last24h, last7d, blocked7d, users7d] = await Promise.all([
    prisma.loginLog.count({ where: { createdAt: { gte: since24h } } }),
    prisma.loginLog.count({ where: { createdAt: { gte: since7d } } }),
    prisma.loginLog.count({ where: { createdAt: { gte: since7d }, result: BLOCKED } }),
    prisma.loginLog.groupBy({ by: ["userId"], where: { createdAt: { gte: since7d }, userId: { not: null } } }),
  ]);
  return { last24h, last7d, blocked7d, uniqueUsers7d: users7d.length };
}

export async function loginLogList(context: Context): Promise<ApiResult<LoginLogListResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = parseLoginLogQuery(context.query as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  const { page, limit, ...filters } = parsed.value;
  const where = loginLogWhere(filters);

  const [total, rows, stats] = await Promise.all([
    prisma.loginLog.count({ where }),
    prisma.loginLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: LOGIN_LOG_SELECT,
    }),
    loginLogStats(new Date()),
  ]);

  return {
    success: true,
    data: {
      items: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      page,
      limit,
      total,
      stats,
    },
  };
}
