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

// Endpoint API yang boleh di-POST warga anonim (form publik /darmasaba),
// tanpa login. Master data (jenislayanan/jenispengaduan) bertingkat di bawah
// path ini & di-CRUD admin → sengaja TIDAK didaftarkan supaya tetap kena guard.
// Karena itu pencocokan WAJIB exact-match (lihat isPublicPostPath), bukan prefix.
export const PUBLIC_POST_PATHS: readonly string[] = [
  "/api/inovasi/ajukanideinovatif/create",
  "/api/inovasi/layananonlinedesa/administrasionline/create",
  "/api/inovasi/layananonlinedesa/pengaduanmasyarakat/create",
  // Upload gambar khusus pengaduan (image-only, tervalidasi) — bukan
  // /api/fileStorage/create yang generik & tetap admin-only.
  "/api/inovasi/layananonlinedesa/pengaduanmasyarakat/upload",
];

/**
 * Apakah path ini form publik yang boleh POST tanpa login.
 * EXACT-match by design: prefix-match akan membocorkan sub-path master data
 * admin (mis. .../administrasionline/jenislayanan/create) yang harus tetap guard.
 */
export function isPublicPostPath(pathname: string): boolean {
  return PUBLIC_POST_PATHS.includes(pathname);
}

/**
 * Origin publik (proto://host) dari header request. Di belakang proxy
 * (Cloudflare → Portainer), `nextUrl.origin` ter-resolve ke host internal container
 * (`https://localhost:3000`) → fetch HTTPS ke localhost gagal TLS
 * (ERR_TLS_CERT_ALTNAME_INVALID). Prioritaskan X-Forwarded-* dari proxy.
 * Fungsi murni — header bisa berupa list "a, b" (rantai proxy), ambil entri pertama.
 */
export function publicOriginFromHeaders(get: (name: string) => string | null): string {
  const proto = get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host =
    get("x-forwarded-host")?.split(",")[0]?.trim() ||
    get("host")?.split(",")[0]?.trim() ||
    "";
  return `${proto}://${host}`;
}

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
