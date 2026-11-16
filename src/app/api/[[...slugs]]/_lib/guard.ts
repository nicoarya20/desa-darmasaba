import type { Context } from "elysia";
import { requireAuth, type AuthUser } from "@/lib/api-auth";
import type { ApiFailure } from "@/lib/jenna/types";

export type RoleGuardResult = { ok: true; user: AuthUser } | { ok: false; body: ApiFailure };

/** Sesi wajib + role lolos `allow`. Gagal → set status (401/403) dan kembalikan body galat seragam. */
export async function requireRole(
  context: Pick<Context, "set">,
  allow: (roleId: AuthUser["roleId"]) => boolean,
  message: string,
): Promise<RoleGuardResult> {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    const { message } = (await authResult.response.json()) as { message: string };
    context.set.status = authResult.response.status;
    return { ok: false, body: { success: false, message } };
  }
  if (!allow(authResult.user.roleId)) {
    context.set.status = 403;
    return { ok: false, body: { success: false, message } };
  }
  return { ok: true, user: authResult.user };
}
