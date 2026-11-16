import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import { AUDIT_ACTIONS, type AuditAction } from "@/lib/audit";
import type { ApiResult } from "@/lib/jenna/types";
import type { ValidationResult } from "@/lib/jenna/validation";
import prisma from "@/lib/prisma";
import { requireDeveloper } from "./guard";
import { noStore } from "./jenna-conversations";

// Log Audit bersifat append-only: hanya endpoint baca, tidak ada ubah/hapus.

export const LOG_PAGE = { defaultLimit: 25, maxLimit: 100 } as const;
export const LOG_SEARCH_MAX = 100;

const POSITIVE_INT_PATTERN = /^[1-9]\d{0,5}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const TARGET_TYPE_PATTERN = /^[a-z][a-z0-9_.]{0,39}$/;
// Tanggal saja (UTC) atau tanggal-waktu dengan zona eksplisit; tanpa zona ditolak karena ambigu.
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/;

const isBlank = (v: unknown) => v === undefined || v === "";

export type LogQuery = { page: number; limit: number; q: string | null; from: Date | null; to: Date | null };

function parseIsoDate(raw: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(raw);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const day = new Date(Date.UTC(y, m - 1, d));
  if (day.getUTCFullYear() !== y || day.getUTCMonth() !== m - 1 || day.getUTCDate() !== d) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `?name=` opsional yang harus cocok pola; kosong = null. */
export function parseOptionalParam(
  raw: unknown,
  test: (v: string) => boolean,
  error: string,
): ValidationResult<string | null> {
  if (isBlank(raw)) return { ok: true, value: null };
  if (typeof raw !== "string" || !test(raw)) return { ok: false, error };
  return { ok: true, value: raw };
}

export const isLogId = (v: string) => ID_PATTERN.test(v);

/** page, limit, q, from, to — bersama untuk Log Audit dan Log Login. `from`/`to` inklusif. */
export function parseLogQuery(query: Record<string, unknown> | undefined): ValidationResult<LogQuery> {
  const { page: rawPage, limit: rawLimit, q: rawQ, from: rawFrom, to: rawTo } = query ?? {};

  let page = 1;
  if (!isBlank(rawPage)) {
    if (typeof rawPage !== "string" || !POSITIVE_INT_PATTERN.test(rawPage)) {
      return { ok: false, error: "Parameter page harus bilangan bulat ≥ 1." };
    }
    page = Number(rawPage);
  }

  let limit: number = LOG_PAGE.defaultLimit;
  if (!isBlank(rawLimit)) {
    if (typeof rawLimit !== "string" || !POSITIVE_INT_PATTERN.test(rawLimit) || Number(rawLimit) > LOG_PAGE.maxLimit) {
      return { ok: false, error: `Parameter limit harus di antara 1 dan ${LOG_PAGE.maxLimit}.` };
    }
    limit = Number(rawLimit);
  }

  let q: string | null = null;
  if (!isBlank(rawQ)) {
    if (typeof rawQ !== "string" || rawQ.length > LOG_SEARCH_MAX) {
      return { ok: false, error: `Kata kunci pencarian maksimal ${LOG_SEARCH_MAX} karakter.` };
    }
    q = rawQ.trim() || null;
  }

  const dates: { from: Date | null; to: Date | null } = { from: null, to: null };
  for (const [key, raw] of [["from", rawFrom], ["to", rawTo]] as const) {
    if (isBlank(raw)) continue;
    const date = typeof raw === "string" ? parseIsoDate(raw) : null;
    if (!date) return { ok: false, error: `Parameter ${key} harus tanggal ISO 8601 yang valid.` };
    dates[key] = date;
  }
  if (dates.from && dates.to && dates.from > dates.to) {
    return { ok: false, error: "Parameter from tidak boleh setelah to." };
  }

  return { ok: true, value: { page, limit, q, ...dates } };
}

export function createdAtRange(from: Date | null, to: Date | null): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return { ...(from && { gte: from }), ...(to && { lte: to }) };
}

const AUDIT_ACTION_VALUES: readonly string[] = Object.values(AUDIT_ACTIONS);
const isAuditAction = (v: string): v is AuditAction => AUDIT_ACTION_VALUES.includes(v);

export type AuditLogQuery = LogQuery & { action: AuditAction | null; actorId: string | null; targetType: string | null };

export function parseAuditLogQuery(query: Record<string, unknown> | undefined): ValidationResult<AuditLogQuery> {
  const base = parseLogQuery(query);
  if (!base.ok) return base;
  const { action: rawAction, actorId: rawActorId, targetType: rawTargetType } = query ?? {};

  const action = parseOptionalParam(rawAction, isAuditAction, "Parameter action tidak dikenal.");
  if (!action.ok) return action;
  const actorId = parseOptionalParam(rawActorId, isLogId, "Parameter actorId tidak valid.");
  if (!actorId.ok) return actorId;
  const targetType = parseOptionalParam(rawTargetType, (v) => TARGET_TYPE_PATTERN.test(v), "Parameter targetType tidak valid.");
  if (!targetType.ok) return targetType;

  return {
    ok: true,
    value: { ...base.value, action: action.value as AuditAction | null, actorId: actorId.value, targetType: targetType.value },
  };
}

/** Filter selain `action` (facet aksi dihitung tanpa filter aksi supaya pilihan lain tetap terlihat). */
export function auditLogBaseWhere(query: Omit<AuditLogQuery, "page" | "limit" | "action">): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (query.actorId) where.actorId = query.actorId;
  if (query.targetType) where.targetType = query.targetType;
  const createdAt = createdAtRange(query.from, query.to);
  if (createdAt) where.createdAt = createdAt;
  if (query.q) {
    const contains = { contains: query.q, mode: "insensitive" as const };
    where.OR = [{ summary: contains }, { actorEmail: contains }, { targetId: contains }];
  }
  return where;
}

export type AuditLogItem = {
  id: string;
  /** ISO string. */
  createdAt: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRoleId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  meta: Prisma.JsonValue | null;
};

export type AuditLogListResponse = {
  items: AuditLogItem[];
  page: number;
  limit: number;
  total: number;
  facets: { actions: { action: string; count: number }[] };
};

export const AUDIT_LOG_SELECT = {
  id: true,
  createdAt: true,
  actorId: true,
  actorEmail: true,
  actorRoleId: true,
  action: true,
  targetType: true,
  targetId: true,
  summary: true,
  meta: true,
} satisfies Prisma.AuditLogSelect;

export async function auditLogList(context: Context): Promise<ApiResult<AuditLogListResponse>> {
  noStore(context);
  const guard = await requireDeveloper(context);
  if (!guard.ok) return guard.body;

  const parsed = parseAuditLogQuery(context.query as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.error };
  }
  const { page, limit, action, ...filters } = parsed.value;
  const baseWhere = auditLogBaseWhere(filters);
  const where = action ? { ...baseWhere, action } : baseWhere;

  const [total, rows, groups] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: AUDIT_LOG_SELECT,
    }),
    prisma.auditLog.groupBy({ by: ["action"], where: baseWhere, _count: { _all: true } }),
  ]);

  const actions = groups
    .map((g) => ({ action: g.action, count: g._count._all }))
    .sort((a, b) => b.count - a.count || a.action.localeCompare(b.action));

  return {
    success: true,
    data: {
      items: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      page,
      limit,
      total,
      facets: { actions },
    },
  };
}
