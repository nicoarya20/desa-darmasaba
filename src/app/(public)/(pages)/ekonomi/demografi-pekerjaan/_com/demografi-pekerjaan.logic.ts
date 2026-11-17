import {
  compareStatValueDesc,
  parseJumlah,
  summarizeStatBars,
  type StatBarItem,
  type StatBarsSummary,
} from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Bentuk mentah satu baris find-many `DataDemografiPekerjaan` (dibaca longgar). */
export type DemografiPekerjaanApiItem = { id?: unknown; pekerjaan?: unknown; lakiLaki?: unknown; perempuan?: unknown; updatedAt?: unknown };

/** Satu pekerjaan: `value` = laki-laki + perempuan, `segments` = [laki-laki, perempuan]. */
export type DemografiPekerjaanItem = StatBarItem & { segments: [number | null, number | null] };

export type DemografiPekerjaanSummary = StatBarsSummary<DemografiPekerjaanItem>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** ApiFetch (Eden) mengubah tanggal ISO jadi Date; fetch mentah memberi string. Selain itu → null. */
function toUpdatedAt(value: unknown): string | Date | null {
  if (value instanceof Date) return value;
  return text(value) || null;
}

/**
 * Normalkan satu baris. Kolom DB `Int`, tapi API menerima angka apa pun (negatif/pecahan): jumlah yang tak terbaca
 * sebagai bilangan bulat ≥ 0 → null. Bila salah satu null, total pekerjaan itu "Belum diisi" (tidak ditebak).
 */
export function toDemografiPekerjaanItem(raw: DemografiPekerjaanApiItem): DemografiPekerjaanItem {
  const laki = parseJumlah(raw.lakiLaki);
  const perempuan = parseJumlah(raw.perempuan);
  return {
    id: String(raw.id ?? ""),
    label: text(raw.pekerjaan),
    value: laki !== null && perempuan !== null ? laki + perempuan : null,
    segments: [laki, perempuan],
    updatedAt: toUpdatedAt(raw.updatedAt),
  };
}

/** Peringkat: pekerjaan dengan penduduk terbanyak dulu, belum diisi di akhir. Nama ganda tidak digabung. */
export function summarizeDemografiPekerjaan(items: readonly DemografiPekerjaanItem[]): DemografiPekerjaanSummary {
  return summarizeStatBars(items, { compare: compareStatValueDesc });
}
