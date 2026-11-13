import { isSampahSumber } from "@/lib/sampah/sampah-item";
import { dokumenApbdesSampahSource } from "./dokumen-apbdes.source";
import { dokumenDakSampahSource } from "./dokumen-dak.source";
import { dokumenPerencanaanSampahSource } from "./dokumen-perencanaan.source";
import { fotoBumdesSampahSource } from "./foto-bumdes.source";
import type { SampahSource } from "./types";

/** Semua sumber Sampah (4 fitur koleksi soft-delete) — cakupan purge harian. */
export const SAMPAH_SOURCES: readonly SampahSource[] = [
  dokumenDakSampahSource,
  dokumenApbdesSampahSource,
  fotoBumdesSampahSource,
  dokumenPerencanaanSampahSource,
];

/** Sumber untuk `:sumber` di `/api/sampah` (hanya `SAMPAH_SUMBER`; DAK tidak); undefined bila tidak dikenal. */
export function sampahSourceBySumber(sumber: string): SampahSource | undefined {
  return isSampahSumber(sumber) ? SAMPAH_SOURCES.find((s) => s.key === sumber) : undefined;
}
