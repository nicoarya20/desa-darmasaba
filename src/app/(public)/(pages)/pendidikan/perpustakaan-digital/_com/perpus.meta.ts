import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Konstanta halaman Perpustakaan Digital publik (`/pendidikan/perpustakaan-digital/{semua|kategori}[/{id}]`). */

export const PERPUS_BASE_HREF = '/pendidikan/perpustakaan-digital';

/**
 * Banyak buku yang dimuat sekaligus (satu permintaan findMany).
 * MITIGASI SEMENTARA(perpus-katalog): kategori, cari, urut, dan jumlah dihitung di klien karena API memfilter
 * kategori lewat nama dan hanya mencari judul (docs/BACKEND-TODO.md P2). Stg 2026-11-15: 28 buku. Buku ke-101 dst.
 * tidak tampil (ada console.warn). Hapus bila API mendukung filter kategori (id/slug) + cari, lalu kembali ke
 * paginasi server.
 */
export const PERPUS_LIST_LIMIT = 100;

/** Rel "Buku lain di kategori ini" di halaman detail. */
export const BUKU_LAIN_MAX = 12;

/** Pilihan Urutkan; elemen pertama = bawaan (tidak ditulis ke URL `?urut=`). */
export const PERPUS_URUT = ['terbaru', 'judul'] as const;
export type PerpusUrut = (typeof PERPUS_URUT)[number];

/** Kartu kerangka selama daftar dimuat. */
export const PERPUS_SKELETON_COUNT = 12;

/** Variabel warna brand untuk akar halaman (pil, tombol, fokus). */
export const PERPUS_BRAND_VARS = {
  '--brand': colors['blue-button'],
} as CSSProperties;
