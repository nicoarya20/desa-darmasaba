import colors from "@/con/colors";
import type { CSSProperties } from "react";
import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";

/** Konstanta halaman Posyandu: rute, tab, ambang privasi, batas muat. */

export const POSYANDU_HREF = "/kesehatan/posyandu";

/** Tab halaman; nilai juga dipakai di URL (`?tab=`) agar kembali dari detail mendarat di tab yang sama. */
export const POSYANDU_TABS = ["ringkasan", "posyandu", "balita", "ibu-hamil"] as const;
export type PosyanduTab = (typeof POSYANDU_TABS)[number];
export const DEFAULT_TAB: PosyanduTab = "ringkasan";

/**
 * Ambang privasi: hitungan 1 sampai (AMBANG - 1) ditulis "< AMBANG", dan persentase banjar dengan
 * balita di bawah ambang tidak ditampilkan, karena angka sekecil itu bisa menunjuk ke orang tertentu.
 */
export const PRIVASI_AMBANG = 3;

/** Semua posyandu dimuat sekaligus (direktori tanpa paginasi; jumlahnya belasan). */
export const POSYANDU_LIST_LIMIT = 100;

/** Permintaan statistik per banjar yang berjalan bersamaan (tiap permintaan = 7 query DB). */
export const BANJAR_STATS_CONCURRENCY = 4;

/** Variabel `--accent`/`--tint` per kartu ringkasan (warna netral, bukan penilaian baik/buruk). */
export const ACCENT = {
  brand: { "--accent": colors["blue-button"], "--tint": colors["blue-button-1"] } as CSSProperties,
  teal: { "--accent": "var(--mantine-color-teal-7)", "--tint": "var(--mantine-color-teal-0)" } as CSSProperties,
  orange: { "--accent": "var(--mantine-color-orange-7)", "--tint": "var(--mantine-color-orange-0)" } as CSSProperties,
};

/** Variabel warna halaman: brand APBDes + tint brand. */
export const POSYANDU_BRAND_VARS = {
  ...APBDES_BRAND_VARS,
  "--brand-tint": colors["blue-button-1"],
} as CSSProperties;
