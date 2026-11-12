import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Kontak yang dimuat sekaligus (data ±4); semua tampil tanpa paginasi. */
export const KONTAK_LIST_LIMIT = 50;

/** Kolom cari baru tampil bila kontak lebih dari angka ini; untuk daftar pendek cari hanya menambah langkah. */
export const KONTAK_SEARCH_THRESHOLD = 6;

/** Rute halaman daftar Kontak Darurat Kesehatan. */
export const KONTAK_LIST_HREF = '/kesehatan/kontak-darurat';

/** Rute detail satu kontak. */
export const kontakDetailHref = (id: string) => `${KONTAK_LIST_HREF}/${encodeURIComponent(id)}`;

/** Variabel warna untuk akar halaman Kontak Darurat (judul, tombol, fokus). */
export const KONTAK_BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
} as CSSProperties;

/** Warna logo WhatsApp untuk ikon tombol (ikon dekoratif; tombol tetap berlabel teks). */
export const WHATSAPP_GREEN = '#25D366';

/**
 * Nomor darurat nasional yang selalu tampil di atas daftar. Statis (bukan dari API) karena nomornya sama
 * di seluruh Indonesia dan tidak dikelola admin desa: 112 panggilan darurat terpadu, 119 PSC/ambulans Kemenkes.
 */
export const NATIONAL_EMERGENCY_NUMBERS = ['112', '119'] as const;

export type NationalEmergencyNumber = (typeof NATIONAL_EMERGENCY_NUMBERS)[number];
