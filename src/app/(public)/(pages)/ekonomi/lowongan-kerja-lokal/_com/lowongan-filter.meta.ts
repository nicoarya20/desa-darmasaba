import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Konstanta halaman daftar lowongan publik (`/ekonomi/lowongan-kerja-lokal`): batas muat, pilihan filter, urutan. */

/**
 * Banyak lowongan yang dimuat sekaligus (satu permintaan find-many).
 * MITIGASI SEMENTARA(lowongan-filter): saring di klien sampai API mendukung — docs/BACKEND-TODO.md P2.
 * API hanya mencari kata kunci, tanpa saringan tipe, lokasi, gaji, waktu tayang, urutan, maupun jumlah per
 * pilihan, jadi semua itu dihitung di klien dari daftar ini. Stg 2026-11-14: 7 lowongan. Entri ke-101 dst. tidak
 * tampil (ada console.warn). Hapus bila backend menambah saringan dan facet, lalu kembali ke paginasi server.
 */
export const LOWONGAN_LIST_LIMIT = 100;

export const LOWONGAN_BASE_HREF = '/ekonomi/lowongan-kerja-lokal';

/** Ambang "gaji per bulan minimal" (rupiah) yang ditawarkan grup Gaji; juga satu-satunya nilai sah `?gaji=`. */
export const GAJI_MIN_OPTIONS = [1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000] as const;
export type GajiMin = (typeof GAJI_MIN_OPTIONS)[number];

/** Pilihan grup Waktu tayang, dalam hari ke belakang; juga satu-satunya nilai sah `?tayang=`. */
export const TAYANG_HARI_OPTIONS = [7, 30, 90] as const;
export type TayangHari = (typeof TAYANG_HARI_OPTIONS)[number];

/** Pilihan Urutkan; elemen pertama = bawaan (tidak ditulis ke URL). */
export const LOWONGAN_URUT = ['terbaru', 'gaji-desc', 'gaji-asc'] as const;
export type LowonganUrut = (typeof LOWONGAN_URUT)[number];

/**
 * Pilihan grup Lokasi kerja; juga satu-satunya nilai sah `?lokasi=`.
 * MITIGASI SEMENTARA(lowongan-wilayah): "di dalam desa" ditebak dari kata Darmasaba di alamat (`Lowongan.diDesa`, dihitung
 * adapter) karena belum ada kolom wilayah di data lowongan. Hapus bila backend menyediakan kolom wilayah.
 */
export const LOKASI_OPTIONS = ['desa', 'luar'] as const;
export type LokasiKerja = (typeof LOKASI_OPTIONS)[number];

/** Baris kerangka pil di panel Filter selama data belum siap. */
export const FILTER_SKELETON_ROWS = 4;

/** Lebar tempat panel kiri diganti pil Filter + drawer (sama dengan breakpoint CSS 1068px). */
export const LOWONGAN_DRAWER_QUERY = '(max-width: 1068px)';

/** Variabel warna brand untuk akar halaman lowongan (panel Filter, pil terpilih, fokus, kartu). */
export const LOWONGAN_BRAND_VARS = {
  '--brand': colors['blue-button'],
} as CSSProperties;
