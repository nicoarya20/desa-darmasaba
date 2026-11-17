import { summarizeStatBars, type StatBarItem, type StatBarsSummary } from "@/app/(public)/_com/stat-bars/stat-bars.logic";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";

/** Bentuk minimal item `/api/ekonomi/sektourunggulandesa/find-many` (model `SektorUnggulanDesa`). */
export type SektorApiItem = {
  id: string;
  name: string;
  /** HTML editor admin. */
  description?: string | null;
  value?: number | null;
  /** Opsional di admin (mis. "ton", "%"); kosong = angka polos, tanpa satuan karangan frontend. */
  satuan?: string | null;
  periode?: string | null;
  updatedAt?: string | Date | null;
};

/** Satu sektor siap tampil; field opsional tidak ada bila kosong di data. */
export type Sektor = {
  id: string;
  name: string;
  /** null = belum diisi (bukan 0). */
  value: number | null;
  satuan?: string;
  periode?: string;
  /** HTML deskripsi yang sudah disaring. */
  html?: string;
  /** ISO; dibaca `latestUpdate` stat-bars untuk "Data diperbarui". */
  updatedAt: string | null;
};

/** Baris panel batang + deskripsi tersaring untuk rincian; `figure` = teks angka buatan halaman ini (tanpa persen). */
export type SektorBar = StatBarItem & { html?: string };

export type SektorSummary = {
  /** Urut nilai tertinggi; belum diisi di akhir (`stat.belumDiisi`). */
  stat: StatBarsSummary<SektorBar>;
  /** Batang hanya bila semua nilai terisi bersatuan sama (atau semua tanpa satuan) dan ada nilai > 0. */
  comparable: boolean;
  /** Satuan bersama (hanya bila `comparable` dan terisi). */
  unit?: string;
  /** Periode bersama bila semua sektor bernilai memakai periode yang sama. */
  periode?: string;
};

export function toSektor(item: SektorApiItem, sanitize: (html: string) => string = sanitizeRichText): Sektor {
  const value = typeof item.value === "number" && Number.isFinite(item.value) ? item.value : null;
  const html = htmlToPlainText(item.description) && item.description ? sanitize(item.description) : "";
  const updated = item.updatedAt ? new Date(item.updatedAt) : null;
  const validUpdated = updated && !Number.isNaN(updated.getTime()) ? updated.toISOString() : null;
  return {
    id: item.id,
    name: item.name.trim(),
    value,
    satuan: item.satuan?.trim() || undefined,
    periode: item.periode?.trim() || undefined,
    html: html || undefined,
    updatedAt: validUpdated,
  };
}

/** Nilai tertinggi dulu; belum diisi di akhir; nilai sama → nama A–Z (urutan stabil, bukan `createdAt`). */
export function rankSektor<T extends Pick<Sektor, "name" | "value">>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.value === null || b.value === null) return a.value === b.value ? byName(a, b) : a.value === null ? 1 : -1;
    return b.value - a.value || byName(a, b);
  });
}

function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "id");
}

/** Satu nilai bila semua isian sama (abaikan huruf besar/spasi), selain itu undefined; `size` = jumlah ragam. */
function sharedText(values: readonly (string | undefined)[]): { size: number; value?: string } {
  const keys = new Map(values.map((v) => [v?.toLowerCase() ?? "", v]));
  return { size: keys.size, value: keys.size === 1 ? [...keys.values()][0] : undefined };
}

export function summarizeSektor(items: readonly Sektor[]): SektorSummary {
  const ranked = rankSektor(items);
  const filled = ranked.filter((item) => item.value !== null);
  const max = Math.max(0, ...filled.map((item) => item.value as number));
  const units = sharedText(filled.map((item) => item.satuan));
  const comparable = filled.length > 0 && units.size === 1 && max > 0;
  const shared = { unit: comparable ? units.value : undefined, periode: sharedText(filled.map((item) => item.periode)).value };
  const bars: SektorBar[] = ranked.map((item) => ({
    id: item.id,
    label: item.name,
    value: item.value,
    figure: sektorFigure(item, shared) ?? undefined,
    updatedAt: item.updatedAt,
    html: item.html,
  }));
  // Tanpa `compare`: urutan peringkat (nilai sama → nama A–Z) sudah ditetapkan rankSektor.
  return { stat: summarizeStatBars(bars), comparable, ...shared };
}

/** Angka Indonesia polos (`1.250`, `0,5`), tanpa satuan karangan. */
export function formatNilai(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

/**
 * Teks keterangan angka per baris: satuan & periode hanya ditulis bila tidak sudah tercantum di kepala panel
 * (bersama). Contoh: "90", "1.250 ton", "30 ekor · 2025". null bila nilai belum diisi.
 */
export function sektorFigure(
  row: Pick<Sektor, "value" | "satuan" | "periode">,
  summary: Pick<SektorSummary, "unit" | "periode">,
): string | null {
  if (row.value === null) return null;
  const satuan = row.satuan && !summary.unit ? ` ${row.satuan}` : "";
  const periode = row.periode && !summary.periode ? ` · ${row.periode}` : "";
  return `${formatNilai(row.value)}${satuan}${periode}`;
}
