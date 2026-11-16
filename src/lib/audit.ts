import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const AUDIT_ACTIONS = {
  USER_UPDATE: "user.update",
  USER_ROLE_UPDATE: "user.role.update",
  USER_ACTIVATE: "user.activate",
  USER_DEACTIVATE: "user.deactivate",
  USER_DELETE: "user.delete",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  JENNA_SETTINGS_UPDATE: "jenna.settings.update",
  JENNA_PROVIDER_UPDATE: "jenna.provider.update",
  JENNA_PROVIDER_KEY_DELETE: "jenna.provider.key.delete",
  JENNA_VOICE_PROVIDER_UPDATE: "jenna.voice.provider.update",
  JENNA_VOICE_PROVIDER_KEY_DELETE: "jenna.voice.provider.key.delete",
  JENNA_CONVERSATION_VIEW: "jenna.conversation.view",
  JENNA_CONVERSATION_DELETE: "jenna.conversation.delete",
  LAPORAN_PUBLIK_STATUS_UPDATE: "laporan_publik.status.update",
  LAPORAN_PUBLIK_DELETE: "laporan_publik.delete",
  MENU_VISIBILITY_UPDATE: "menu_visibility.update",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditActor = {
  id: string;
  email?: string | null;
  roleId?: string | number | null;
};

export type AuditInput = {
  actor: AuditActor | null;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  summary: string;
  meta?: Record<string, unknown>;
};

const MAX_STRING = 500;
const MAX_ITEMS = 20;
const MAX_DEPTH = 3;

function sanitizeValue(value: unknown, depth: number): Prisma.InputJsonValue | null | undefined {
  if (value === null) return null;
  if (typeof value === "string") return value.length > MAX_STRING ? value.slice(0, MAX_STRING) : value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (depth >= MAX_DEPTH) return undefined;
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1))
      .filter((item): item is Prisma.InputJsonValue | null => item !== undefined);
  }
  if (typeof value === "object") {
    const out: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, MAX_ITEMS)) {
      const clean = sanitizeValue(item, depth + 1);
      if (clean !== undefined) out[key] = clean;
    }
    return out;
  }
  return undefined;
}

/** Bentuk `meta` aman untuk Json: primitif/array/objek kecil, string dipotong 500 karakter. */
export function sanitizeAuditMeta(meta: Record<string, unknown> | undefined): Prisma.InputJsonObject | undefined {
  if (!meta) return undefined;
  return sanitizeValue(meta, 0) as Prisma.InputJsonObject;
}

const isForeignKeyError = (err: unknown) =>
  typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2003";

/** Catat aksi admin setelah mutasi sukses. Best-effort: tidak pernah melempar. */
export async function audit(input: AuditInput): Promise<void> {
  // meta tidak boleh berisi PII warga (isi form, NIK, nomor HP, isi percakapan).
  const data: Prisma.AuditLogUncheckedCreateInput = {
    actorId: input.actor?.id ?? null,
    actorEmail: input.actor?.email ?? null,
    actorRoleId: input.actor?.roleId == null ? null : String(input.actor.roleId),
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    summary: input.summary,
    meta: sanitizeAuditMeta(input.meta),
  };

  try {
    await prisma.auditLog.create({ data });
  } catch (err) {
    if (!isForeignKeyError(err) || data.actorId === null) {
      console.warn(`[audit] gagal mencatat ${input.action}`, err);
      return;
    }
    try {
      await prisma.auditLog.create({ data: { ...data, actorId: null } });
    } catch (retryErr) {
      console.warn(`[audit] gagal mencatat ${input.action}`, retryErr);
    }
  }
}
