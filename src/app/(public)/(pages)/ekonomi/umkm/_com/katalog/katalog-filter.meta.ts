import colors from '@/con/colors';
import type { CSSProperties } from 'react';

/** Konstanta halaman katalog UMKM publik (`/ekonomi/umkm`): batas muat, tab, urutan, rute. */

/**
 * Banyak produk / UMKM yang dimuat sekaligus (satu permintaan find-many per daftar).
 * MITIGASI SEMENTARA(umkm-katalog): saring di klien sampai API mendukung — docs/BACKEND-TODO.md P2.
 * API hanya menyaring satu kategori/toko, tanpa rentang harga, urutan, maupun jumlah per kategori,
 * jadi semua itu dihitung di klien dari daftar ini. Stg 2026-11-13: 7 produk, 8 UMKM. Entri ke-101 dst. tidak
 * tampil (ada console.warn). Hapus bila backend menambah saringan & facet, lalu kembali ke paginasi server.
 */
export const KATALOG_LIST_LIMIT = 100;

export const KATALOG_BASE_HREF = '/ekonomi/umkm';

export const KATALOG_TABS = ['produk', 'toko'] as const;
export type KatalogTab = (typeof KATALOG_TABS)[number];

/** Urutan tab Produk; elemen pertama = bawaan. */
export const PRODUK_URUT = ['terbaru', 'harga-asc', 'harga-desc', 'nama'] as const;
/** Urutan tab Toko; elemen pertama = bawaan. */
export const TOKO_URUT = ['nama', 'terbaru'] as const;
export type KatalogUrut = (typeof PRODUK_URUT)[number] | (typeof TOKO_URUT)[number];

/** Pilihan toko yang tampil sebelum "Lihat semua" di grup Toko (tombol hanya bila ≥2 pilihan tersembunyi). */
export const TOKO_FACET_VISIBLE = 5;

/** Lebar tempat panel kiri diganti tombol Saring + drawer (sama dengan breakpoint CSS 1068px). */
export const KATALOG_DRAWER_QUERY = '(max-width: 1068px)';

/** Variabel warna brand untuk akar halaman katalog (judul, tab, fokus, kartu). */
export const KATALOG_BRAND_VARS = {
  '--brand': colors['blue-button'],
} as CSSProperties;
