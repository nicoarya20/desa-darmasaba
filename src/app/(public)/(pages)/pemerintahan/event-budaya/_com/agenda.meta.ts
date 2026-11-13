import type { CSSProperties } from 'react';

/** Konstanta halaman Agenda & Kalender Desa: batas muat data, lajur kalender, rute. */

/**
 * Batas acara yang dimuat per tahun (satu permintaan per tahun yang dibuka). Desa memuat ±15–40 acara
 * setahun; bila suatu saat melewati batas ini, sisa acara tidak tampil di kalender — naikkan nilainya.
 */
export const AGENDA_TAHUN_LIMIT = 300;

/** Jumlah acara di panel "Acara mendatang" (1 sorotan + sisanya baris). */
export const AGENDA_MENDATANG_LIMIT = 5;

/** Lajur acara yang terlihat per minggu di kalender bulan desktop; sisanya jadi "+N lainnya". */
export const KALENDER_LAJUR_MAKS = 3;

/** Titik kategori maksimal per hari di kalender ringkas ponsel. */
export const KALENDER_TITIK_MAKS = 3;

/**
 * Variabel warna satu acara dari warna Mantine kategorinya: garis tebal (`--ev`), latar pucat (`--ev-bg`),
 * dan tinta teks (`--ev-ink`) — pola blok acara Outlook.
 */
export function varWarnaKategori(warna: string): CSSProperties {
  return {
    '--ev': `var(--mantine-color-${warna}-6)`,
    '--ev-bg': `var(--mantine-color-${warna}-0)`,
    '--ev-ink': `var(--mantine-color-${warna}-9)`,
  } as CSSProperties;
}
