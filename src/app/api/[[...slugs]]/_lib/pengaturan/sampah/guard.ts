import type { Context } from "elysia";
import { requireAuth } from "@/lib/api-auth";
import { canManageSampah } from "@/lib/sampah/sampah-access";

export type SampahGuardFail = { success: false; message: string };

/**
 * Guard endpoint Sampah: wajib sesi aktif (401 tanpa sesi, 403 akun nonaktif) dan role 0/1 (403). Dicek di
 * handler karena guard global `route.ts` tidak menjaga GET di luar ADMIN_ONLY_GET_PATHS. Body error atau null.
 */
export async function guardSampah(set: Context["set"]): Promise<SampahGuardFail | null> {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    // Bentuk error seragam { success, message } (bukan Response mentah), mengikuti menu_visibility/update.
    const { message } = (await authResult.response.json()) as { message: string };
    set.status = authResult.response.status;
    return { success: false, message };
  }
  if (!canManageSampah(authResult.user.roleId)) {
    set.status = 403;
    return { success: false, message: "Hanya Super Admin atau Developer yang boleh mengelola Sampah" };
  }
  return null;
}
