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

export type MusikSearchNavigation = { href: string; mode: 'replace' | 'push' };

/**
 * Navigasi kolom cari dihitung dari lokasi yang HIDUP saat dikirim (bukan searchParams render lama), supaya
 * genre/artis yang baru dipilih selama jeda ketik tidak hilang. Di Jelajahi → replace (parameter lain
 * dipertahankan); dari menu lain → push, dan kata kosong tidak menavigasi (null).
 */
export function musikSearchNavigation(q: string, pathname: string, search: string): MusikSearchNavigation | null {
  const onJelajahi = activeMusikNav(pathname) === 'jelajahi';
  if (!onJelajahi && !q.trim()) return null;
  return { href: musikSearchHref(q, onJelajahi ? new URLSearchParams(search) : null), mode: onJelajahi ? 'replace' : 'push' };
}

/**
 * Selaraskan `?q=` baru di URL dengan kata yang sudah dikirim kolom cari tapi belum terlihat di URL (urut kirim).
 * URL = salah satu kiriman sendiri → itu gema navigasi kita: kiriman sampai titik itu dibuang dan ketikan
 * tidak ditimpa (`adopt: false`). Selain itu perubahan datang dari luar (mundur, "Hapus filter") → `adopt: true`.
 */
export function reconcileSentQ(sent: readonly string[], urlQ: string): { sent: string[]; adopt: boolean } {
  const index = sent.indexOf(urlQ);
  if (index >= 0) return { sent: sent.slice(index + 1), adopt: false };
  return { sent: [], adopt: true };
}

/** Ketikan yang masih menunggu jeda hanya boleh bertahan bila menu baru adalah Jelajahi (tujuan cari itu sendiri). */
export function keepsPendingSearch(pathname: string | null): boolean {
  return activeMusikNav(pathname) === 'jelajahi';
}
