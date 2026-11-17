import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Id anchor bagian "Cara membaca" (target tombol kedua di kepala halaman). */
export const PERPUS_CARA_ID = 'cara-membaca';

/** Variabel warna brand untuk akar halaman (judul, tombol, fokus, ilustrasi). */
export const PERPUS_BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
  '--brand-tint': colors['blue-button-1'],
  '--accent': colors.orange,
} as CSSProperties;
