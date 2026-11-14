import { MUSIK_BASE_PATH, MUSIK_JELAJAHI_PATH, MUSIK_NAV_ITEMS, type MusikNavKey } from './musik-nav.meta';

const stripTrailingSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Menu aktif dari pathname; halaman di luar aplikasi musik → null. Sub-rute ikut menu induknya. */
export function activeMusikNav(pathname: string | null): MusikNavKey | null {
  if (!pathname) return null;
  const path = stripTrailingSlash(pathname);
  if (path === MUSIK_BASE_PATH) return 'musik';
  const match = MUSIK_NAV_ITEMS.find((item) => item.key !== 'musik' && (path === item.href || path.startsWith(`${item.href}/`)));
  return match?.key ?? null;
}

/**
 * URL Jelajahi untuk kata cari `q`. `current` = parameter Jelajahi saat ini (genre/artis dipertahankan);
 * dari halaman lain berikan null. Kata kosong/spasi saja → `q` dihapus.
 */
export function musikSearchHref(q: string, current: URLSearchParams | null): string {
  const params = new URLSearchParams(current ?? undefined);
  const term = q.trim();
  if (term) params.set('q', term);
  else params.delete('q');
  const query = params.toString();
  return query ? `${MUSIK_JELAJAHI_PATH}?${query}` : MUSIK_JELAJAHI_PATH;
}
