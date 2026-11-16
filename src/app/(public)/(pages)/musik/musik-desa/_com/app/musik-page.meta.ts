import type { Metadata } from 'next';
import { MUSIK_JELAJAHI_PATH, type MusikNavKey } from './musik-nav.meta';

const APP_TITLE = 'Musik Desa';

/**
 * Metadata per menu aplikasi Musik Desa (dipakai `page.tsx` server). Sufiks situs " | Desa Darmasaba"
 * ditambahkan oleh `title.template` di root layout. Jelajahi memakai canonical tanpa query supaya
 * `?q=` / `?genre=` / `?artis=` tidak terindeks sebagai halaman terpisah.
 */
export const MUSIK_PAGE_METADATA = {
  musik: { title: APP_TITLE },
  jelajahi: { title: `Jelajahi · ${APP_TITLE}`, alternates: { canonical: MUSIK_JELAJAHI_PATH } },
  playlist: { title: `Playlist · ${APP_TITLE}` },
} as const satisfies Record<MusikNavKey, Metadata>;
