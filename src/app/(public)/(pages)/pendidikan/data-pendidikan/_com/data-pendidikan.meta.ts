import colors from "@/con/colors";
import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";
import type { CSSProperties } from "react";

/**
 * Semua kategori dimuat sekaligus (biasanya 4–8 jenjang), karena total dan persen butuh seluruh baris.
 * API find-many tetap berpaginasi (bawaan 10); 100 jauh di atas jumlah jenjang yang masuk akal.
 */
export const DATA_PENDIDIKAN_LIMIT = 100;

/** Variabel warna halaman: brand APBDes + tint brand untuk lingkaran ikon ubin kosong. */
export const DATA_PENDIDIKAN_BRAND_VARS = { ...APBDES_BRAND_VARS, "--brand-tint": colors["blue-button-1"] } as CSSProperties;
