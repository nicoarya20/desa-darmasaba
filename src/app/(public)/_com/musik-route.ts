/**
 * Rute aplikasi Musik Desa yang perlu diketahui shell situs (`DarmasabaShell`). Sengaja ringan (tanpa ikon,
 * teks, atau komponen) supaya shell bersama tidak mengimpor modul privat `musik-desa/_com`.
 */

/** Segmen menu Musik di situs. `/musik` sendiri tidak punya halaman (404 disengaja, lihat menu-root-no-page). */
export const MUSIK_SECTION_PATH = '/musik';
/** Akar aplikasi Musik Desa; semua menunya (Musik, Jelajahi, Playlist) ada di bawah satu layout. */
export const MUSIK_BASE_PATH = `${MUSIK_SECTION_PATH}/musik-desa`;

/**
 * Rute yang memakai bar pemutar aplikasi musik (bukan FixedPlayerBar + footer situs): hanya
 * `/musik/musik-desa` dan turunannya. `/musik` dan `/musik/<lain>` (404) tetap memakai shell biasa.
 */
export function isMusikAppPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === MUSIK_BASE_PATH || pathname.startsWith(`${MUSIK_BASE_PATH}/`);
}
