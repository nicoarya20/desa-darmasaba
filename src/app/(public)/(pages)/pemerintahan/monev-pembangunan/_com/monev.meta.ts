import colors from "@/con/colors";
import { STATUS_PEMBANGUNAN_COLOR, type StatusPembangunan } from "@/lib/kegiatan-pembangunan";
import { IconCircleCheck, IconClipboardList, IconProgress, type Icon } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import { APBDES_BRAND_VARS } from "@/app/(public)/_com/main-page/apbdes/apbdes.meta";

/** Tautan ke halaman realisasi APBDes. */
export const APBDES_HREF = "/apbdes";

/** Tautan detail satu kegiatan pembangunan. */
export const kegiatanDetailHref = (id: string) => `/pemerintahan/kegiatan-desa/pembangunan/${id}`;

/** Status yang tampil di batang sebaran: tiga status resmi + kegiatan yang statusnya belum diisi. */
export type StatusKey = StatusPembangunan | "belumDiisi";

type StatusMeta = { accent: string; tint: string };

// Warna mengikuti STATUS_PEMBANGUNAN_COLOR (badge admin & halaman kegiatan) agar status bermakna sama di semua halaman.
const mantineAccent = (s: StatusPembangunan): StatusMeta => ({
  accent: `var(--mantine-color-${STATUS_PEMBANGUNAN_COLOR[s]}-6)`,
  tint: `var(--mantine-color-${STATUS_PEMBANGUNAN_COLOR[s]}-0)`,
});

/** Warna aksen + tint per status (dipakai pil status, batang sebaran, dan legenda). */
export const STATUS_META: Record<StatusKey, StatusMeta> = {
  rencana: mantineAccent("rencana"),
  berjalan: mantineAccent("berjalan"),
  selesai: mantineAccent("selesai"),
  belumDiisi: { accent: "var(--mantine-color-gray-4)", tint: "var(--mantine-color-gray-1)" },
};

/** Ikon per status resmi (legenda ringkasan). */
export const STATUS_ICON: Record<StatusPembangunan, Icon> = {
  rencana: IconClipboardList,
  berjalan: IconProgress,
  selesai: IconCircleCheck,
};

/** Variabel CSS `--accent`/`--tint` untuk elemen bertema status. */
export function statusVars(key: StatusKey): CSSProperties {
  const { accent, tint } = STATUS_META[key];
  return { "--accent": accent, "--tint": tint } as CSSProperties;
}

/** Variabel `--accent`/`--tint` kartu ringkasan non-status (warna brand, sama dengan kartu Belanja APBDes). */
export const BRAND_ACCENT_VARS = {
  "--accent": "var(--brand)",
  "--tint": "var(--brand-tint)",
} as CSSProperties;

/** Variabel warna halaman: brand APBDes + tint brand untuk lingkaran ikon. */
export const MONEV_BRAND_VARS = {
  ...APBDES_BRAND_VARS,
  "--brand-tint": colors["blue-button-1"],
} as CSSProperties;
