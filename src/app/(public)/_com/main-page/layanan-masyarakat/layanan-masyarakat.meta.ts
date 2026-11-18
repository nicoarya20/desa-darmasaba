import type { LayananDesa } from "@/con/layanan-desa";
import { IconFileSearch, IconFileText, IconHeartHandshake, IconMessageReport, type Icon } from "@tabler/icons-react";

/** Ikon kartu per layanan (Tabler, tanpa emoji). */
export const LAYANAN_ICONS: Readonly<Record<LayananDesa["id"], Icon>> = {
  administrasi: IconFileText,
  sosial: IconHeartHandshake,
  pengaduan: IconMessageReport,
  informasi: IconFileSearch,
};
