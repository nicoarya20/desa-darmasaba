import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section SDGs Desa beranda: sumber data, jumlah kartu, rute, warna brand. */

export const SDGS_FIND_MANY_URL = "/api/landingpage/sdgsdesa/findMany";

/** Jumlah tujuan berskor tertinggi yang ditampilkan di beranda. */
export const SDGS_TOP_LIMIT = 4;

export const SDGS_DETAIL_HREF = "/darmasaba/sdgs-desa";

/** Variabel warna brand (judul, tombol) untuk section SDGs Desa. */
export const SDGS_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;
