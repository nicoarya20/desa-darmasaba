// Hak akses halaman Pengaturan → Sampah (dipisah dari auth-policy.ts yang sudah mendekati batas ukuran).
import { ROLE_DEVELOPER, ROLE_SUPER_ADMIN } from "@/lib/auth-policy";

/** Role yang boleh melihat, memulihkan, dan menghapus permanen isi Sampah (sama dengan menu Pengaturan). */
export const SAMPAH_MANAGER_ROLES: readonly string[] = [ROLE_DEVELOPER, ROLE_SUPER_ADMIN];

/** True bila role boleh mengelola Sampah (role "0" Developer / "1" Super Admin). */
export function canManageSampah(roleId: string | number | null | undefined): boolean {
  return roleId !== null && roleId !== undefined && SAMPAH_MANAGER_ROLES.includes(String(roleId));
}
