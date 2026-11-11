import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Banyak surat keterangan yang dimuat sekaligus (data ±11); semua tampil tanpa paginasi, cari di klien. */
export const LAYANAN_LIST_LIMIT = 100;

/** Id rekaman tunggal Perizinan Berusaha & Penduduk Non-Permanen (dibuat seed, diubah admin lewat id ini). */
export const LAYANAN_SINGLETON_ID = "edit";

/** Alamat resmi portal OSS. */
export const OSS_URL = "https://oss.go.id/";

/** Variabel warna brand untuk akar halaman Layanan (judul, tombol, fokus). */
export const LAYANAN_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;

/** Rute detail satu layanan surat keterangan. */
export const layananDetailHref = (id: string) => `/darmasaba/pemerintahan/layanan/${id}`;
