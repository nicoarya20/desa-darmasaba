import type { CSSProperties } from "react";

/** Batas jumlah segmen yang punya warna sendiri (brand + 2 turunan); segmen ke-4 dst. memakai warna terakhir. */
export const STAT_SEGMENT_COLORS = 3;

/**
 * Variabel warna panel & ubin. Segmen netral (brand + turunan brand, bukan biru/pink): kontras batang
 * ke latar ubin tetap ≥ 3:1 untuk dua segmen pertama di kedua tema. `--brand` dibaca dari wadah pemakai;
 * segmen 2-3 & tint = token grafik --c-* (terang = #2F91CC/#8AC1E3/#E5F2FA seperti sebelumnya).
 */
export const STAT_BARS_VARS = {
  "--stat-seg-0": "var(--brand)",
  "--stat-seg-1": "var(--c-chart-2)",
  "--stat-seg-2": "var(--c-chart-3)",
  "--stat-tint": "var(--c-brand-tint)",
} as CSSProperties;

/** Nilai CSS warna segmen ke-`index`. */
export function statSegmentColor(index: number): string {
  return `var(--stat-seg-${Math.min(index, STAT_SEGMENT_COLORS - 1)})`;
}
