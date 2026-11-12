import { legacyJabatanRedirect, strukturAdminRoutes } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';

/** Rute admin Struktur PPID (menu: PPID → Struktur PPID, basePath `/admin/ppid/struktur-ppid`). */
export const STRUKTUR_PPID_ROUTES = strukturAdminRoutes('/admin/ppid/struktur-ppid');

/** Tujuan redirect URL lama tab "Posisi Organisasi" PPID ke tab Jabatan (lihat `legacyJabatanRedirect`). */
export function legacyPosisiRedirect(slug: readonly string[] | undefined): string {
  return legacyJabatanRedirect(STRUKTUR_PPID_ROUTES, slug);
}
