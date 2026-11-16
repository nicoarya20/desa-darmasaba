import type { Context } from "elysia";
import { requireAuth, type AuthUser } from "@/lib/api-auth";
import { isDeveloperRole } from "@/lib/auth-policy";
import type { ApiFailure } from "@/lib/jenna/types";

/** Sesi wajib + role "0". Gagal → set status (401/403) dan kembalikan body galat seragam. */
export async function requireDeveloper(
  context: Pick<Context, "set">,
): Promise<{ ok: true; user: AuthUser } | { ok: false; body: ApiFailure }> {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    const { message } = (await authResult.response.json()) as { message: string };
    context.set.status = authResult.response.status;
    return { ok: false, body: { success: false, message } };
  }
  if (!isDeveloperRole(authResult.user.roleId)) {
    context.set.status = 403;
    return { ok: false, body: { success: false, message: "Hanya Developer yang boleh mengakses menu ini" } };
  }
  return { ok: true, user: authResult.user };
}
