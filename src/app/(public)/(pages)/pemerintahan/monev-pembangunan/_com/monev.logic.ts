// Aturan tampilan halaman publik Monev & Pembangunan — fungsi murni tanpa I/O.
import {
  STATUS_PEMBANGUNAN,
  STATUS_PEMBANGUNAN_LABEL,
  isStatusPembangunan,
  type MonevSummary,
  type StatusPembangunan,
} from "@/lib/kegiatan-pembangunan";
import type { StatusKey } from "./monev.meta";
import { MONEV_TEXT } from "./monev.text";

/** Nilai filter "semua status". */
export const FILTER_ALL = "semua";

/** Opsi SegmentedControl filter: Semua + tiga status. */
export const FILTER_OPTIONS = [
  { value: FILTER_ALL, label: MONEV_TEXT.filterAll },
  ...STATUS_PEMBANGUNAN.map((s) => ({ value: s, label: STATUS_PEMBANGUNAN_LABEL[s] })),
];

/** Parameter status untuk API (`""` = semua). */
export function statusQuery(filter: string): string {
  return isStatusPembangunan(filter) ? filter : "";
}

/** Belum ada satu pun kegiatan pembangunan → halaman menampilkan keadaan kosong, bukan angka 0. */
export function isMonevEmpty(summary: MonevSummary): boolean {
  return summary.totalKegiatan <= 0;
}

export type StatusSegment = { key: StatusKey; label: string; count: number; width: number };

/**
 * Potongan batang sebaran status (lebar % dari total kegiatan). Tiga status resmi selalu ada
 * (untuk legenda); "belum diisi" hanya bila ada kegiatan tanpa status.
 */
export function statusSegments(summary: MonevSummary): StatusSegment[] {
  const total = summary.totalKegiatan;
  const width = (count: number) => (total > 0 ? (count / total) * 100 : 0);
  const segments: StatusSegment[] = STATUS_PEMBANGUNAN.map((s) => ({
    key: s,
    label: STATUS_PEMBANGUNAN_LABEL[s],
    count: summary.perStatus[s],
    width: width(summary.perStatus[s]),
  }));
  const belum = summary.perStatus.belumDiisi;
  if (belum > 0) segments.push({ key: "belumDiisi", label: MONEV_TEXT.belumDiisi, count: belum, width: width(belum) });
  return segments;
}

/** Status valid kegiatan, atau null bila belum diisi / tidak dikenal. */
export function kegiatanStatus(value: string | null | undefined): StatusPembangunan | null {
  return isStatusPembangunan(value) ? value : null;
}

/** Progres kegiatan 0–100, atau null bila belum dilaporkan. */
export function kegiatanProgres(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

/** Teks satu baris lokasi + sumber dana; bagian kosong dilewati. */
export function kegiatanMeta(item: { lokasi?: string | null; sumberDana?: string | null }): string {
  const parts = [item.lokasi?.trim(), item.sumberDana?.trim() ? MONEV_TEXT.sumberDana(item.sumberDana.trim()) : null];
  return parts.filter(Boolean).join(" · ");
}
