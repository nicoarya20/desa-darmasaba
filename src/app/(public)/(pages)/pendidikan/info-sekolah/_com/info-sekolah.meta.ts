import { jenjangRank } from "@/lib/jenjang-pendidikan-urutan";
import type { CSSProperties } from "react";

/** Konstanta halaman Info Sekolah: batas muat, nama panjang jenjang, warna jenjang. */

/** Semua lembaga dimuat sekaligus untuk direktori per jenjang (jumlahnya belasan). */
export const LEMBAGA_LIST_LIMIT = 100;

/** Jenjang untuk pil filter (satu baris per jenjang; hanya beberapa). */
export const JENJANG_LIST_LIMIT = 100;

/** Baris per halaman daftar pengajar. */
export const PENGAJAR_PAGE_SIZE = 10;

/** Nama panjang jenjang baku; jenjang lain cukup memakai namanya sendiri. */
const NAMA_PANJANG: Record<string, string> = {
  paud: "Pendidikan Anak Usia Dini",
  tk: "Taman Kanak-kanak",
  sd: "Sekolah Dasar",
  smp: "Sekolah Menengah Pertama",
  sma: "Sekolah Menengah Atas",
  smk: "Sekolah Menengah Kejuruan",
};

/** Nama panjang jenjang (`SD` → `Sekolah Dasar`), atau `null` bila bukan jenjang baku. */
export function namaPanjangJenjang(nama: string): string | null {
  return NAMA_PANJANG[nama.trim().toLowerCase()] ?? null;
}

/**
 * Warna penanda jenjang (titik & batang sebaran), netral, urut jenjang baku agar sama di semua halaman.
 * Biru = --c-chart-1 (terang = biru brand lama, gelap lebih terang); warna Mantine lain terbaca di dua tema.
 */
const JENJANG_ACCENTS = [
  "var(--mantine-color-grape-6)",
  "var(--mantine-color-orange-6)",
  "var(--c-chart-1)",
  "var(--mantine-color-teal-6)",
  "var(--mantine-color-cyan-7)",
  "var(--mantine-color-lime-7)",
  "var(--mantine-color-pink-6)",
];

/** Variabel `--accent` untuk satu jenjang. */
export function jenjangAccent(nama: string): CSSProperties {
  return { "--accent": JENJANG_ACCENTS[jenjangRank(nama) % JENJANG_ACCENTS.length] } as CSSProperties;
}
