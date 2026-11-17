import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Batas jumlah segmen yang punya warna sendiri (brand + 2 turunan); segmen ke-4 dst. memakai warna terakhir. */
export const STAT_SEGMENT_COLORS = 3;

/**
 * Variabel warna panel & ubin. Segmen netral (brand + turunan brand, bukan biru/pink): kontras batang
 * ke latar #f5f5f7 tetap ≥ 3:1 untuk dua segmen pertama. `--brand` dibaca dari wadah pemakai
 * (KABAR_BRAND_VARS / APBDES_BRAND_VARS).
 */
export const STAT_BARS_VARS = {
  "--stat-seg-0": "var(--brand)",
  "--stat-seg-1": colors["blue-button-5"],
  "--stat-seg-2": colors["blue-button-3"],
  "--stat-tint": colors["blue-button-1"],
} as CSSProperties;

/** Nilai CSS warna segmen ke-`index`. */
export function statSegmentColor(index: number): string {
  return `var(--stat-seg-${Math.min(index, STAT_SEGMENT_COLORS - 1)})`;
}
