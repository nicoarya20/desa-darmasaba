import { status, type Context } from "elysia";
import type { AuthUser } from "@/lib/api-auth";
import { canManageMenuAccess, isDeveloperRole } from "@/lib/auth-policy";
import type { ApiFailure } from "@/lib/jenna/types";
import { requireRole } from "../guard";

export type UserManagerContext = Context & { actor: AuthUser };

const requireUserManager = (context: Pick<Context, "set">, subject: "user" | "role") =>
  requireRole(context, canManageMenuAccess, `Hanya Developer atau Super Admin yang boleh mengelola ${subject}`);

/** Resolve router /user: role 0/1 → `actor` di context; selain itu 401/403. */
export async function resolveUserManager(context: Pick<Context, "set">) {
  const guard = await requireUserManager(context, "user");
  if (!guard.ok) return status(context.set.status as number, guard.body);
  return { actor: guard.user };
}

/** Resolve grup mutasi /role: role 0/1 → `actor` di context; selain itu 401/403. */
export async function resolveRoleManager(context: Pick<Context, "set">) {
  const guard = await requireUserManager(context, "role");
  if (!guard.ok) return status(context.set.status as number, guard.body);
  return { actor: guard.user };
}

/** Hanya Developer yang boleh memberi role "0" atau mengubah/menghapus akun role "0" → selain itu 403. */
export function denyDeveloperAccountChange(
  context: Pick<Context, "set">,
  actor: AuthUser,
  targetRoleId: string | null | undefined,
  nextRoleId?: string,
): ApiFailure | null {
  if (isDeveloperRole(actor.roleId)) return null;
  if (!isDeveloperRole(targetRoleId) && !isDeveloperRole(nextRoleId)) return null;
  context.set.status = 403;
  return { success: false, message: "Hanya Developer yang boleh memberi role Developer atau mengubah akun Developer" };
}
