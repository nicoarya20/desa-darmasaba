import type { CSSProperties } from "react";

/** Konstanta section Kabar Desa beranda: jumlah item, rute, warna brand. */

/** 1 berita utama + 3 kartu kecil. */
export const KABAR_BERITA_LIMIT = 4;

export const KABAR_PENGUMUMAN_LIMIT = 3;

/**
 * Panjang teks contoh kerangka (karakter), dari data berita & pengumuman terbaru: baris meta "KATEGORI · 19 NOV 2026"
 * ±22, judul berita 59-69, ringkasan 113-140, judul pengumuman 64-103, tanggal "19 Nov 2026" 11. Judul/ringkasan
 * terpotong line-clamp seperti aslinya, jadi teks contoh yang sedikit lebih panjang pun tetap setinggi isi.
 * Judul berita sengaja sepanjang batas clamp: huruf judul asli lebih lebar dari teks contoh (judul 65 karakter
 * memenuhi 4 baris unggulan di ponsel), dan tinggi rel = kartu tertinggi, jadi satu judul 3 baris sudah menentukan.
 */
export const KABAR_SKELETON_CHARS = {
  meta: 22,
  beritaTitle: 100,
  beritaSummary: 125,
  pengumumanTitle: 75,
  date: 11,
} as const;

/** Kategori pengganti di URL detail bila item tak punya kategori (segmen ini tak dibaca halaman detail). */
export const KABAR_FALLBACK_KATEGORI = "umum";

export const BERITA_BASE_HREF = "/pemerintahan/berita";
export const BERITA_LIST_HREF = `${BERITA_BASE_HREF}/semua`;
export const PENGUMUMAN_BASE_HREF = "/pemerintahan/pengumuman";

/**
 * Variabel warna brand (judul, tautan, kategori) untuk halaman yang memakai kerangka Kabar.
 * @deprecated Beranda tidak lagi memakainya: `.section` kabar.module.css sudah mengalias `--brand` ke token
 * `--c-brand` (terang/gelap). Dipertahankan agar halaman menu lain (Fase 2/3 dark theme) tetap jalan; nilainya
 * token, jadi tema terang identik dan tema gelap ikut. Hapus pemakaiannya saat menu itu dikerjakan.
 */
export const KABAR_BRAND_VARS = {
  "--brand": "var(--c-brand)",
} as CSSProperties;
