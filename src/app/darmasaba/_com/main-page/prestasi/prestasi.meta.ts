import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section & halaman Prestasi dan Penghargaan Desa: batas kartu, rute, warna, video hero. */
export const PRESTASI_BERANDA_LIMIT = 4;

/** Kartu per halaman di halaman gabungan (genap → grid 2 kolom penuh). */
export const PRESTASI_PAGE_SIZE = 8;

/** Halaman gabungan; juga basis rute detail prestasi (`/darmasaba/prestasi-desa/{id}`). */
export const PRESTASI_LIST_HREF = "/darmasaba/prestasi-desa";

/** Nama kategori prestasi yang menampung entri eks-Penghargaan (sama dengan migrasi & seed). */
export const PENGHARGAAN_KATEGORI_NAME = "Penghargaan";

/** Video latar hero (sama dengan section Penghargaan lama) + poster saat video belum/tidak diputar. */
export const PRESTASI_HERO_VIDEO = {
  src: "/assets/videos/award.mp4",
  poster: "/mangupuraaward.jpeg",
} as const;

/** Variabel warna brand (tombol CTA) untuk section Prestasi. */
export const PRESTASI_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;
