import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section Kabar Desa beranda: jumlah item, rute, warna brand. */

/** 1 berita utama + 3 kartu kecil. */
export const KABAR_BERITA_LIMIT = 4;

export const KABAR_PENGUMUMAN_LIMIT = 3;

/** Kategori pengganti di URL detail bila item tak punya kategori (segmen ini tak dibaca halaman detail). */
export const KABAR_FALLBACK_KATEGORI = "umum";

export const BERITA_BASE_HREF = "/darmasaba/pemerintahan/berita";
export const BERITA_LIST_HREF = `${BERITA_BASE_HREF}/semua`;
export const PENGUMUMAN_BASE_HREF = "/darmasaba/pemerintahan/pengumuman";

/** Variabel warna brand (judul, tautan, kategori) untuk section Kabar Desa. */
export const KABAR_BRAND_VARS = {
  "--brand": colors["blue-button"],
} as CSSProperties;
