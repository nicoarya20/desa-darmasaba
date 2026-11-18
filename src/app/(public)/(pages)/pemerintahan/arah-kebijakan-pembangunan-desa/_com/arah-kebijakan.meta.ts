import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";
import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Variabel warna halaman: brand APBDes + tint brand (kerangka halaman meminjam gaya APBDes/Monev). */
export const ARAH_BRAND_VARS = {
  ...APBDES_BRAND_VARS,
  "--brand-tint": colors["blue-button-1"],
} as CSSProperties;
