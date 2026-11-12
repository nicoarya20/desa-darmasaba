import { dokumenApbdesSampahSource } from "./dokumen-apbdes.source";
import { dokumenDakSampahSource } from "./dokumen-dak.source";
import { dokumenPerencanaanSampahSource } from "./dokumen-perencanaan.source";
import { fileSampahSource } from "./file.source";
import { fotoBumdesSampahSource } from "./foto-bumdes.source";
import type { SampahSource } from "./types";

/** Semua sumber item Sampah global (berkas + adapter entitas koleksi soft-delete). */
export const SAMPAH_SOURCES: readonly SampahSource[] = [
  fileSampahSource,
  dokumenDakSampahSource,
  dokumenApbdesSampahSource,
  fotoBumdesSampahSource,
  dokumenPerencanaanSampahSource,
];

/** Sumber berdasarkan prefix ID item; undefined bila tidak dikenal. */
export function sampahSourceByKey(key: string): SampahSource | undefined {
  return SAMPAH_SOURCES.find((s) => s.key === key);
}
