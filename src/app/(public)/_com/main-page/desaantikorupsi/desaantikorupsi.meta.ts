import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section Desa Anti Korupsi beranda: jumlah butir, rute, warna brand. */

/** Jumlah indikator yang tampil di beranda (sisanya di halaman detail). */
export const ANTIKORUPSI_LIMIT = 6;

export const ANTIKORUPSI_DETAIL_HREF = "/desa-anti-korupsi/detail";

/** Variabel warna brand (judul, nomor indikator, tombol) untuk section Desa Anti Korupsi. */
export const ANTIKORUPSI_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;
