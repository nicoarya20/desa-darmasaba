/** Konstanta modul Pengangguran (dipakai 2 rute: Jumlah Pengangguran & Usia Kerja yang Menganggur). */

/**
 * Batas muat find-many. API berbawaan limit 10 dan urutannya merusak paginasi (BACKEND-TODO), jadi diminta eksplisit
 * lalu diurut di klien. 120 = 10 tahun data bulanan; lebih dari itu → console.warn (MITIGASI SEMENTARA pengangguran-limit).
 */
export const PENGANGGURAN_FETCH_LIMIT = 120;
/** Model sebaran usia/pendidikan: hanya baris terbaru yang tampil, tapi semua baris dimuat untuk memilihnya. */
export const SEBARAN_FETCH_LIMIT = 50;

export const JUMLAH_PENGANGGURAN_HREF = "/ekonomi/jumlah-pengangguran";
export const USIA_KERJA_MENGANGGUR_HREF = "/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur";

/** Dua seri grafik (token tema, terang = #0a4e78 / #2f91cc): terdidik = brand, tidak terdidik = turunan brand (sama dengan segmen ke-2 stat-bars) (bertumpuk, jadi tinggi batang = jumlah). */
export const SERI_WARNA = {
  terdidik: "var(--c-chart-1)",
  tidakTerdidik: "var(--c-chart-2)",
} as const;

/** Kolom model `GrafikMenganggurBerdasarkanUsia`, urut kelompok usia. */
export const KOLOM_USIA = [
  { key: "usia18_25", label: "18–25 tahun" },
  { key: "usia26_35", label: "26–35 tahun" },
  { key: "usia36_45", label: "36–45 tahun" },
  { key: "usia46_keatas", label: "46 tahun ke atas" },
] as const;

/** Kolom model `GrafikMenganggurBerdasarkanPendidikan`, urut jenjang. Label "SMA/SMK" dipertahankan (keputusan user). */
export const KOLOM_PENDIDIKAN = [
  { key: "SD", label: "SD" },
  { key: "SMP", label: "SMP" },
  { key: "SMA", label: "SMA/SMK" },
  { key: "D3", label: "D3" },
  { key: "S1", label: "S1" },
] as const;
