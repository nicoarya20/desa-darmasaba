import { IconCompass, IconMusic, IconPlaylist, type Icon } from '@tabler/icons-react';
import { MUSIK_BASE_PATH } from '@/app/(public)/_com/musik-route';

/** Akar rute aplikasi (sumber tunggal di modul rute bersama, dipakai juga oleh shell situs). */
export { MUSIK_BASE_PATH };
export const MUSIK_JELAJAHI_PATH = `${MUSIK_BASE_PATH}/jelajahi`;
export const MUSIK_PLAYLIST_PATH = `${MUSIK_BASE_PATH}/playlist`;

/** Jeda ketik (ms) sebelum kolom cari memperbarui URL Jelajahi. */
export const MUSIK_SEARCH_DEBOUNCE_MS = 300;

export type MusikNavKey = 'musik' | 'jelajahi' | 'playlist';

export type MusikNavItem = { key: MusikNavKey; label: string; href: string; icon: Icon };

/** Menu sidebar kiri (desktop) dan pil tab (≤1068px), urutan tampil. */
export const MUSIK_NAV_ITEMS: readonly MusikNavItem[] = [
  { key: 'musik', label: 'Musik', href: MUSIK_BASE_PATH, icon: IconMusic },
  { key: 'jelajahi', label: 'Jelajahi', href: MUSIK_JELAJAHI_PATH, icon: IconCompass },
  { key: 'playlist', label: 'Playlist', href: MUSIK_PLAYLIST_PATH, icon: IconPlaylist },
];

/** Teks UI kerangka aplikasi (sidebar, topbar, panel antrean). */
export const MUSIK_APP_TEXT = {
  navLabel: 'Menu Musik Desa',
  playlistHeading: 'Playlist',
  // TODO(musik-playlist): ganti dengan daftar playlist admin setelah model & endpoint ada — docs/BACKEND-TODO.md
  playlistEmpty: 'Belum ada playlist dari admin.',
  searchLabel: 'Cari musik',
  searchPlaceholder: 'Cari lagu, artis, atau genre',
  queueLabel: 'Antrean',
} as const;
