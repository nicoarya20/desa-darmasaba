import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Kategori grafik: `name` = label tampil, dicocokkan (huruf kecil) dengan nama opsi dari database. */
export type Category = { readonly name: string; readonly color: string };

// Palet satu rona biru brand (gelap → terang) agar senada grafik APBDes; urutan rating = gelap ke terang.
export const JENIS_KELAMIN: readonly Category[] = [
  { name: "Laki-laki", color: colors["blue-button"] },
  { name: "Perempuan", color: colors["blue-button-3"] },
];

export const RATING: readonly Category[] = [
  { name: "Sangat Baik", color: colors["blue-button"] },
  { name: "Baik", color: colors["blue-button-5"] },
  { name: "Kurang Baik", color: colors["blue-button-3"] },
  { name: "Sangat Kurang Baik", color: colors["blue-button-2"] },
];

export const KELOMPOK_UMUR: readonly Category[] = [
  { name: "Muda", color: colors["blue-button"] },
  { name: "Dewasa", color: colors["blue-button-5"] },
  { name: "Lansia", color: colors["blue-button-3"] },
];

/** Batas data yang dimuat untuk grafik (halaman 1); total responden tetap dari server. */
export const RESPONDEN_CHART_LIMIT = 1000;

/** Warna batang grafik responden per bulan. */
export const MONTHLY_BAR_COLOR = colors["blue-button"];

/** Variabel warna brand section (judul, tombol pil). */
export const KEPUASAN_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;
