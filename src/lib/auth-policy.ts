// Kebijakan role/akses Better Auth — fungsi murni, tanpa I/O.
// Dipisah supaya bisa di-unit-test tanpa DB dan dipakai konsisten oleh
// auth.ts (hook), middleware.ts (guard route), dan api-auth.ts (guard API).

// Roles desa-darmasaba (relasi tabel Role, id string):
//   "0" DEVELOPER | "1" SUPER ADMIN | "2" ADMIN DESA
//   "3" ADMIN KESEHATAN | "4" ADMIN PENDIDIKAN | "5" USER (Login Google)
export const ROLE_SUPER_ADMIN = "1";
export const ROLE_USER = "5";

// roleId 0-4 = admin (boleh akses /admin); 5+ = user biasa.
export const MAX_ADMIN_ROLE = 4;

/** Role untuk user Google BARU: SUPER ADMIN jika email terdaftar, else USER. */
export function resolveRoleForNewUser(
  email: string | null | undefined,
  superAdminEmails: readonly string[],
): string {
  if (email && superAdminEmails.includes(email)) return ROLE_SUPER_ADMIN;
  return ROLE_USER;
}

/** Apakah roleId punya hak akses area admin (roleId <= 4). */
export function isAdminRole(roleId: string | number | null | undefined): boolean {
  const n = Number(roleId ?? ROLE_USER);
  return Number.isFinite(n) && n <= MAX_ADMIN_ROLE;
}

/** Apakah user boleh dilayani (aktif). Non-aktif = ditolak. */
export function isAccountActive(
  isActive: boolean | null | undefined,
): boolean {
  return isActive !== false;
}

// Halaman profil publik untuk user non-admin (roleId 5+).
export const PROFILE_PATH = "/profile";

/** Tujuan redirect setelah login berdasar role (admin → dashboard, user → profil). */
export function defaultRouteForRole(roleId: string | number | null | undefined): string {
  switch (Number(roleId)) {
    case 0:
    case 1:
    case 2:
      return "/admin/landing-page/profil/program-inovasi";
    case 3:
      return "/admin/kesehatan/posyandu/list-posyandu";
    case 4:
      return "/admin/pendidikan/info-sekolah/jenjang-pendidikan";
    default:
      return PROFILE_PATH;
  }
}
