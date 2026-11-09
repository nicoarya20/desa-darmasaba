import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Kategori grafik: `name` = label tampil, dicocokkan (huruf kecil) dengan nama opsi dari database. */
export type Category = { readonly name: string; readonly color: string };

// Jenis kelamin & umur bukan penilaian baik/buruk: palet satu rona biru brand (gelap → terang),
// senada grafik APBDes.
export const JENIS_KELAMIN: readonly Category[] = [
  { name: "Laki-laki", color: colors["blue-button"] },
  { name: "Perempuan", color: colors["blue-button-3"] },
];

/**
 * Warna rating standar baik → buruk (hijau tua, hijau muda, jingga, merah) dari token tema Mantine.
 * Tingkat warna dipilih yang terbaca di kartu #f5f5f7 (kontras: green.8 3,2 · lime.8 2,7 · orange.6 2,4 ·
 * red.8 4,1); legenda selalu menyertakan nama + angka, jadi warna bukan satu-satunya penanda.
 * Kunci = nama rating huruf kecil.
 */
export const RATING_COLORS: Readonly<Record<string, string>> = {
  "sangat baik": "var(--mantine-color-green-8)",
  baik: "var(--mantine-color-lime-8)",
  "kurang baik": "var(--mantine-color-orange-6)",
  "sangat kurang baik": "var(--mantine-color-red-8)",
};

/** Warna netral untuk rating yang tidak ada di `RATING_COLORS`. */
export const RATING_FALLBACK_COLOR = "var(--mantine-color-gray-6)";

/** Warna rating berdasarkan nama (tanpa beda huruf besar/kecil); tak dikenal → abu netral. */
export function ratingColor(name: string): string {
  return RATING_COLORS[name.trim().toLowerCase()] ?? RATING_FALLBACK_COLOR;
}

export const RATING: readonly Category[] = ["Sangat Baik", "Baik", "Kurang Baik", "Sangat Kurang Baik"].map(
  (name) => ({ name, color: ratingColor(name) }),
);

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
