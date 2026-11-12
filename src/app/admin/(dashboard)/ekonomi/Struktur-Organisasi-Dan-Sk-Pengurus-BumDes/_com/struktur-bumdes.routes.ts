import { legacyJabatanRedirect, strukturAdminRoutes } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';

/** basePath modul admin BUMDes (menu `ekonomi.bumdes`); tab Profil & Unit Usaha juga di bawahnya. */
export const BUMDES_ADMIN_BASE = '/admin/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes';

/** Rute admin Struktur BUMDes: tab Pegawai · Jabatan · Bagan di bawah basePath BUMDes. */
export const STRUKTUR_BUMDES_ROUTES = strukturAdminRoutes(BUMDES_ADMIN_BASE);

/** Tujuan redirect URL lama tab "Posisi Organisasi" BUMDes ke tab Jabatan (lihat `legacyJabatanRedirect`). */
export function legacyPosisiRedirect(slug: readonly string[] | undefined): string {
  return legacyJabatanRedirect(STRUKTUR_BUMDES_ROUTES, slug);
}
