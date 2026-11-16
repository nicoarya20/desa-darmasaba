import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";
import colors from "@/con/colors";
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

/** Warna penanda jenjang (titik & batang sebaran), netral, urut jenjang baku agar sama di semua halaman. */
const JENJANG_ACCENTS = [
  "var(--mantine-color-grape-6)",
  "var(--mantine-color-orange-6)",
  colors["blue-button"],
  "var(--mantine-color-teal-6)",
  "var(--mantine-color-cyan-7)",
  "var(--mantine-color-lime-7)",
  "var(--mantine-color-pink-6)",
];

/** Variabel `--accent` untuk satu jenjang. */
export function jenjangAccent(nama: string): CSSProperties {
  return { "--accent": JENJANG_ACCENTS[jenjangRank(nama) % JENJANG_ACCENTS.length] } as CSSProperties;
}

/** Variabel warna halaman: brand APBDes + tint brand untuk ikon. */
export const INFO_SEKOLAH_BRAND_VARS = {
  ...APBDES_BRAND_VARS,
  "--brand-tint": colors["blue-button-1"],
  "--accent": colors["blue-button"],
  "--tint": colors["blue-button-1"],
} as CSSProperties;
