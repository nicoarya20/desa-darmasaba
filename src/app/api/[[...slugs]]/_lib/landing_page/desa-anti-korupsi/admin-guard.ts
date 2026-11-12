import type { Context } from "elysia";
import { requireAuth } from "@/lib/api-auth";
import { isAdminRole } from "@/lib/auth-policy";

export type AdminGuardFail = { success: false; message: string };

/**
 * Guard endpoint khusus admin (sampah & salin dokumen DAK, Sampah per fitur): wajib sesi aktif (401 tanpa sesi,
 * 403 akun nonaktif) dan role admin 0-4 (403, pesan `pesanBukanAdmin`). Dicek di handler karena GET di luar
 * ADMIN_ONLY_GET_PATHS tidak dijaga route.ts, dan guard global hanya memastikan login. Body error, atau null bila lolos.
 */
export async function guardAdmin(
  set: Context["set"],
  pesanBukanAdmin = "Hanya admin yang boleh mengelola dokumen desa anti korupsi",
): Promise<AdminGuardFail | null> {
  const authResult = await requireAuth();
  if (!authResult.authenticated) {
    // Bentuk error seragam { success, message } (bukan Response mentah), mengikuti menu_visibility/update.
    const { message } = (await authResult.response.json()) as { message: string };
    set.status = authResult.response.status;
    return { success: false, message };
  }
  if (!isAdminRole(authResult.user.roleId)) {
    set.status = 403;
    return { success: false, message: pesanBukanAdmin };
  }
  return null;
}
