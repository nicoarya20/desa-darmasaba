import type { CSSProperties } from "react";

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
 * Memakai palet kategori APBDes (`--apbdes-*`, dideklarasikan light-dark di .section/.card apbdes.module.css), jadi
 * ikut tema: brand = --c-brand/--c-brand-tint, teal & oranye = Mantine -7/-0 di terang, -4 + tint redup di gelap.
 */
export const ACCENT = {
  brand: { "--accent": "var(--apbdes-belanja-accent)", "--tint": "var(--apbdes-belanja-tint)" } as CSSProperties,
  teal: { "--accent": "var(--apbdes-pendapatan-accent)", "--tint": "var(--apbdes-pendapatan-tint)" } as CSSProperties,
  orange: { "--accent": "var(--apbdes-pembiayaan-accent)", "--tint": "var(--apbdes-pembiayaan-tint)" } as CSSProperties,
};
