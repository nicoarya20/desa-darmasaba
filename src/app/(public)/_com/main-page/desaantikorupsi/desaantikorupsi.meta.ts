import colors from "@/con/colors";
import type { CSSProperties } from "react";

/** Konstanta section Desa Anti Korupsi beranda: jumlah butir, rute, warna brand. */

/** Jumlah indikator yang tampil di beranda (sisanya di halaman detail). */
export const ANTIKORUPSI_LIMIT = 6;

export const ANTIKORUPSI_DETAIL_HREF = "/desa-anti-korupsi/detail";

/**
 * Variabel warna brand untuk halaman /desa-anti-korupsi/detail dan /program/[id], yang masih berlatar terang
 * tetap (antikorupsi-detail.module.css `.page`). Beranda dan /desa-anti-korupsi memakai `.section`, yang
 * mengambil --brand dari token --c-brand. Hapus bila `.page` sudah ikut tema gelap (Fase 2).
 */
export const ANTIKORUPSI_BRAND_VARS = {
  "--brand": colors["blue-button"],
  "--brand-hover": colors["blue-button-6"],
} as CSSProperties;
