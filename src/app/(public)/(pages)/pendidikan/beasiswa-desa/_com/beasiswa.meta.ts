import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Rute halaman Beasiswa Desa (alamat lama `/pelajari-lebih-lanjut` dialihkan ke `#syarat`). */
export const BEASISWA_HREF = '/pendidikan/beasiswa-desa';

/** Id anchor bagian syarat & alur (target tombol "Syarat dan alur" dan alihan alamat lama). */
export const BEASISWA_SYARAT_ID = 'syarat';

/**
 * Banyak keunggulan program yang dimuat sekaligus (data 2026-11: 5). Semua tampil tanpa paginasi.
 * MITIGASI SEMENTARA(beasiswa-keunggulan): bila admin mengisi > 100, sisanya tidak tampil (console.warn);
 * hapus batas ini bila API menyediakan "semua" atau daftar bertambah jauh.
 */
export const KEUNGGULAN_LIST_LIMIT = 100;

/** Variabel warna brand untuk akar halaman (judul, tombol, fokus). */
export const BEASISWA_BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
} as CSSProperties;

/** Foto kepala halaman (statis di /public). */
export const BEASISWA_HERO_IMAGE = { src: '/beasiswa-siswa.png', width: 599, height: 413 } as const;
