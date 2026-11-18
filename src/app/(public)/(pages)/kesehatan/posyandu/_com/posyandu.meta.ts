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
 * Tab yang DISEMBUNYIKAN sementara (2026-11-17, persiapan Lomba Website Desa 2027): data balita & ibu hamil
 * di prod hanya data contoh dan desa belum memberi rekap resmi Puskesmas (juknis: tanpa data fiktif).
 * Kosongkan array + set `RINGKASAN_STATISTIK_TAMPIL` true setelah rekap resmi masuk.
 */
export const POSYANDU_TABS_TERSEMBUNYI: readonly PosyanduTab[] = ["balita", "ibu-hamil"];

/** Kartu angka gabungan (ibu hamil, balita, stunting, imunisasi, gizi, pemeriksaan) di tab Ringkasan; lihat catatan di atas. */
export const RINGKASAN_STATISTIK_TAMPIL = false;

/** Tab yang tampil, sesuai urutan `POSYANDU_TABS`. */
export const POSYANDU_TABS_TAMPIL: readonly PosyanduTab[] = POSYANDU_TABS.filter((t) => !POSYANDU_TABS_TERSEMBUNYI.includes(t));

/**
 * Ambang privasi persentase: persen banjar dengan balita di bawah ambang tidak ditampilkan, karena
 * persen dari 1-2 anak bisa menunjuk ke anak tertentu. Hitungan (jumlah orang) selalu tampil apa adanya.
 */
export const PRIVASI_AMBANG = 3;

/** Semua posyandu dimuat sekaligus (direktori tanpa paginasi; jumlahnya belasan). */
export const POSYANDU_LIST_LIMIT = 100;

/** Permintaan statistik per banjar yang berjalan bersamaan (tiap permintaan = 7 query DB). */
export const BANJAR_STATS_CONCURRENCY = 4;

/**
 * Variabel `--accent`/`--tint` per kartu ringkasan (warna netral, bukan penilaian baik/buruk).
 * `--accent-text` = varian lebih gelap untuk TEKS di atas `--tint`/#f5f5f7 (WCAG AA ≥4,5:1); `--accent` tetap
 * untuk ikon & dekorasi. Oranye teks `#c2410c` (bukan orange-9 Mantine #d9480f, hanya 4,0:1).
 */
export const ACCENT = {
  brand: { "--accent": colors["blue-button"], "--accent-text": colors["blue-button"], "--tint": colors["blue-button-1"] } as CSSProperties,
  teal: { "--accent": "var(--mantine-color-teal-7)", "--accent-text": "var(--mantine-color-teal-9)", "--tint": "var(--mantine-color-teal-0)" } as CSSProperties,
  orange: { "--accent": "var(--mantine-color-orange-7)", "--accent-text": "#c2410c", "--tint": "var(--mantine-color-orange-0)" } as CSSProperties,
};

/** Variabel warna halaman: brand APBDes + tint brand. */
export const POSYANDU_BRAND_VARS = {
  ...APBDES_BRAND_VARS,
  "--brand-tint": colors["blue-button-1"],
} as CSSProperties;
