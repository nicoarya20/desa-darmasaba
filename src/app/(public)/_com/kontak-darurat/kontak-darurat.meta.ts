import colors from '@/con/colors';
import type { Icon } from '@tabler/icons-react';
import type { CSSProperties } from 'react';

/** Variabel warna untuk akar halaman kontak darurat (judul, tombol, fokus). */
export const KONTAK_BRAND_VARS = {
  '--brand': colors['blue-button'],
  '--brand-hover': colors['blue-button-6'],
} as CSSProperties;

/** Kolom cari baru tampil bila kontak lebih dari angka ini; untuk daftar pendek cari hanya menambah langkah. */
export const KONTAK_SEARCH_THRESHOLD = 6;

/** Warna logo WhatsApp untuk ikon tombol (ikon dekoratif; tombol tetap berlabel teks). */
export const WHATSAPP_GREEN = '#25D366';

/** Satu nomor darurat nasional statis untuk blok NationalEmergency (mis. 112, 110). */
export type NationalEmergencyEntry = {
  number: string;
  name: string;
  /** Nama pendek untuk kartu ringkas 2×2 di mobile (≤734px), mis. "Basarnas". */
  shortName: string;
  description: string;
  icon: Icon;
};
