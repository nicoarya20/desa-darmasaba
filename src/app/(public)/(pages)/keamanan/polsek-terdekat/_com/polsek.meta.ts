import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Polsek yang dimuat sekaligus (data ±4); semua tampil tanpa paginasi. */
export const POLSEK_LIST_LIMIT = 50;

/** Rute halaman Polsek Terdekat (juga tujuan redirect `/semua-polsek`). */
export const POLSEK_HREF = '/keamanan/polsek-terdekat';

/** id bagian peta: tujuan gulir tombol "Lihat di peta". */
export const POLSEK_MAP_SECTION_ID = 'peta-polsek';

/** Variabel warna untuk akar halaman (judul, tombol, fokus). */
export const POLSEK_BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
  '--brand-tint': colors['blue-button-1'],
} as CSSProperties;
