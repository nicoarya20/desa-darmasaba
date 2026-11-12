import { strukturAdminRoutes } from '@/app/admin/(dashboard)/_com/struktur-organisasi/struktur-admin.config';

/** Rute admin Struktur PPID (menu: PPID → Struktur PPID, basePath `/admin/ppid/struktur-ppid`). */
export const STRUKTUR_PPID_ROUTES = strukturAdminRoutes('/admin/ppid/struktur-ppid');

/**
 * Tujuan redirect URL lama tab "Posisi Organisasi" (`posisi-organisasi/[[...slug]]`) ke tab Jabatan:
 * `[]` → daftar, `['create']` → tambah, `[id]` (dulu halaman edit) → edit jabatan; selain itu → daftar.
 */
export function legacyPosisiRedirect(slug: readonly string[] | undefined): string {
  const [first, ...rest] = slug ?? [];
  if (!first || rest.length > 0) return STRUKTUR_PPID_ROUTES.jabatan;
  if (first === 'create') return STRUKTUR_PPID_ROUTES.jabatanCreate;
  return STRUKTUR_PPID_ROUTES.jabatanEdit(first);
}
