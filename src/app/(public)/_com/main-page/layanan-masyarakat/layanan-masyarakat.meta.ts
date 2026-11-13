import colors from "@/con/colors";
import type { LayananDesa } from "@/con/layanan-desa";
import { IconFileSearch, IconFileText, IconHeartHandshake, IconMessageReport, type Icon } from "@tabler/icons-react";
import type { CSSProperties } from "react";

/** Ikon kartu per layanan (Tabler, tanpa emoji). */
export const LAYANAN_ICONS: Readonly<Record<LayananDesa["id"], Icon>> = {
  administrasi: IconFileText,
  sosial: IconHeartHandshake,
  pengaduan: IconMessageReport,
  informasi: IconFileSearch,
};

/** Variabel warna brand section (judul, ikon, label aksi). */
export const LAYANAN_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
  "--brand-tint": colors["blue-button-1"],
} as CSSProperties;
