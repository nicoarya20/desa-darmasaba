import colors from "@/con/colors";
import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";
import type { CSSProperties } from "react";

/** Konstanta halaman CCTV Keamanan Desa: batas muat, ambang cari, zona waktu, zoom peta, warna status. */

/** Semua titik dimuat sekaligus: peta dan daftar saling terhubung, jadi tidak dipaginasi (jumlahnya belasan). */
export const CCTV_LIST_LIMIT = 200;

/** Kolom cari baru tampil bila jumlah titik melebihi angka ini (daftar pendek cukup dipindai mata). */
export const CCTV_SEARCH_THRESHOLD = 6;

/** "Aktif terakhir" ditulis relatif ("2 jam yang lalu") sampai batas hari ini; lebih lama → tanggal. */
export const RELATIVE_MAX_DAYS = 7;

/** Zona waktu tampilan (Bali = WITA), sama dengan tanggal pembaruan APBDes. */
export const CCTV_TIME_ZONE = "Asia/Makassar";
export const CCTV_TIME_ZONE_LABEL = "WITA";

/** Zoom saat satu titik dipilih dari daftar, dan zoom maksimal saat peta memuat semua titik. */
export const MAP_FOCUS_ZOOM = 18;
export const MAP_FIT_MAX_ZOOM = 17;

export type CctvStatusKey = "online" | "offline" | "unknown";

type StatusMeta = { accent: string; tint: string };

/** Warna status: penanda peta, titik di daftar, legenda, dan ubin ringkasan memakai nilai yang sama. */
export const STATUS_META: Record<CctvStatusKey, StatusMeta> = {
  online: { accent: "var(--mantine-color-green-8)", tint: "var(--mantine-color-green-0)" },
  offline: { accent: "var(--mantine-color-red-8)", tint: "var(--mantine-color-red-0)" },
  unknown: { accent: "var(--mantine-color-gray-5)", tint: "var(--mantine-color-gray-1)" },
};

/** Variabel CSS `--accent`/`--tint` untuk elemen bertema status. */
export function statusVars(key: CctvStatusKey): CSSProperties {
  const { accent, tint } = STATUS_META[key];
  return { "--accent": accent, "--tint": tint } as CSSProperties;
}

/** Variabel `--accent`/`--tint` kartu ringkasan berwarna brand. */
export const BRAND_ACCENT_VARS = { "--accent": "var(--brand)", "--tint": "var(--brand-tint)" } as CSSProperties;

/** Variabel warna halaman: brand APBDes + tint brand untuk lingkaran ikon. */
export const CCTV_BRAND_VARS = { ...APBDES_BRAND_VARS, "--brand-tint": colors["blue-button-1"] } as CSSProperties;
