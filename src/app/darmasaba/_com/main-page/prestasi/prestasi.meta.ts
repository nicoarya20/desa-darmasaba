import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section Prestasi Desa di beranda: batas kartu, rute, warna, dan foto hero. */
export const PRESTASI_BERANDA_LIMIT = 4;

export const PRESTASI_LIST_HREF = "/darmasaba/prestasi-desa";

/** Variabel warna brand (tombol CTA) untuk section Prestasi. */
export const PRESTASI_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;

const HERO_DIR = "/assets/images/prestasi";

// TODO(prestasi-hero): foto dummy sementara — "Abiansemal District 2.jpg" (Wikimedia Commons,
// Mx. Granger, CC0; Abiansemal = kecamatan Desa Darmasaba). Ganti dengan foto asli Desa
// Darmasaba bila sudah tersedia. Di-hardcode karena belum ada field foto hero di admin.
export const PRESTASI_HERO_IMAGE = {
  src: `${HERO_DIR}/prestasi-hero-2048.webp`,
  srcSet: [1280, 2048, 3200].map((w) => `${HERO_DIR}/prestasi-hero-${w}.webp ${w}w`).join(", "),
} as const;
