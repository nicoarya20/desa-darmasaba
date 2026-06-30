// Tujuan redirect setelah login berdasar role.
// roleId 0-4 = admin (lihat prisma/data/user/roles.json) → dashboard admin.
// roleId 5 (USER publik Google) atau lebih → halaman profile (standalone, tanpa navbar/footer).
// Replikasi getRedirectPath di validasi-admin/page.tsx agar konsisten dengan login OTP.

export const PROFILE_PATH = "/profile";

export function redirectByRole(roleId: string | number): string {
  const id = Number(roleId);
  switch (id) {
    case 0:
    case 1:
    case 2:
      return "/admin/landing-page/profil/program-inovasi";
    case 3:
      return "/admin/kesehatan/posyandu/list-posyandu";
    case 4:
      return "/admin/pendidikan/info-sekolah/jenjang-pendidikan";
    default:
      // role 5 (USER) dan nilai non-admin lain → profile publik
      return PROFILE_PATH;
  }
}
