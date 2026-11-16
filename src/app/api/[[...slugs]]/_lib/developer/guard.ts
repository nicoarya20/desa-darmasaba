import type { Context } from "elysia";
import { isDeveloperRole } from "@/lib/auth-policy";
import { requireRole, type RoleGuardResult } from "../guard";

/** Sesi wajib + role "0". Gagal → set status (401/403) dan kembalikan body galat seragam. */
export function requireDeveloper(context: Pick<Context, "set">): Promise<RoleGuardResult> {
  return requireRole(context, isDeveloperRole, "Hanya Developer yang boleh mengakses menu ini");
}
