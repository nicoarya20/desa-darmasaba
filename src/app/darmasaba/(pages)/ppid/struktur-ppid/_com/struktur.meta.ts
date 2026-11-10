import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Jumlah pegawai yang dimuat sekaligus — default API 10 membuat pegawai ke-11 dst. tidak tampil di bagan. */
export const STRUKTUR_PEGAWAI_LIMIT = 100;

/** Jeda saring pencarian (ms). */
export const STRUKTUR_SEARCH_DEBOUNCE = 300;

/**
 * Kolom maksimal grup bawahan daun: laptop 2, layar ≥1800px 4 (lihat struktur-chart.module.css).
 * Sengaja genap: saat grup lebih dari satu baris, garis induk turun di celah tengah, tidak menembus kartu.
 */
export const LEAF_COLS = { base: 2, wide: 4 } as const;

/** Rute profil pegawai. */
export const strukturDetailHref = (pegawaiId: string) => `/darmasaba/ppid/struktur-ppid/${pegawaiId}`;

/**
 * Gradasi kartu per tingkat (gelap → terang, teks putih di sisi kiri yang gelap):
 * tingkat 2+ memakai #145F8F di kiri, bukan #2F91CC, agar teks putih tetap kontras ≥ 4.5:1.
 * `--brand` disediakan kerangka halaman (`ppid/_com/PpidPage.tsx`).
 */
export const STRUKTUR_VARS = {
  '--tone-0': `linear-gradient(100deg, ${colors['blue-button-7']} 0%, ${colors['blue-button']} 100%)`,
  '--tone-1': `linear-gradient(100deg, ${colors['blue-button']} 0%, ${colors['blue-button-5']} 100%)`,
  '--tone-2': `linear-gradient(100deg, #145F8F 0%, ${colors['blue-button-4']} 100%)`,
} as CSSProperties;
