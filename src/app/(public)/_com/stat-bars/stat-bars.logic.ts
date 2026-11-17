/** Satu baris statistik yang sudah dinormalkan pemakai (sumber data apa pun). */
export type StatBarItem = {
  id: string;
  label: string;
  /** null = isian admin kosong/tak terbaca: baris "Belum diisi", tanpa batang, tidak ikut total/persen. */
  value: number | null;
  /** Rincian per segmen, urutan sama dengan prop `segments` panel (mis. [laki-laki, perempuan]); null = belum diisi. */
  segments?: readonly (number | null)[];
  /** Teks angka buatan pemakai (mis. "1.250 ton"); bila ada, menggantikan angka + satuan + persen bawaan. */
  figure?: string;
  /** ISO string (fetch) atau Date (ApiFetch/Eden mengubah tanggal ISO jadi Date). */
  updatedAt?: string | Date | null;
  /** Teks kecil di bawah label (mis. "230 KK"); tidak menggantikan angka + persen. */
  detail?: string;
};

/** Baris siap tampil: porsi dari total (persen) dan panjang batang relatif ke nilai terbesar. */
export type StatBarRow<T extends StatBarItem = StatBarItem> = T & {
  share: number | null;
  /** 0–100; panjang batang terhadap nilai terbesar. */
  width: number;
};

export type StatBarsSummary<T extends StatBarItem = StatBarItem> = {
  rows: StatBarRow<T>[];
  /** Jumlah seluruh baris yang terisi; null bila tak satu pun terisi. */
  total: number | null;
  /** Banyaknya baris yang nilainya belum diisi / tidak terbaca. */
  belumDiisi: number;
  latest: Date | null;
  /** Jumlah per segmen dari baris yang terisi; null bila tak satu baris pun punya segmen. */
  segmentTotals: number[] | null;
};

const PLAIN = /^\d+$/;
const DOTTED_THOUSANDS = /^\d{1,3}(\.\d{3})+$/;

/**
 * Bilangan bulat ≥ 0 dari isian admin. Diterima: `874`, `1.200` (titik ribuan gaya Indonesia).
 * Selain itu (`1,5`, `1200 orang`, kosong, negatif) → null, ditulis "Belum diisi", bukan ditebak.
 */
export function parseJumlah(value: unknown): number | null {
  if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0 ? value : null;
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (!PLAIN.test(s) && !DOTTED_THOUSANDS.test(s)) return null;
  const n = Number(s.replaceAll(".", ""));
  return Number.isSafeInteger(n) ? n : null;
}

/** Bilangan gaya Indonesia: `1.906`. */
export function formatJumlah(value: number): string {
  return value.toLocaleString("id-ID");
}

/** Waktu `updatedAt` terbaru; tanggal kosong/rusak diabaikan. */
export function latestUpdate(items: readonly { updatedAt?: string | Date | null }[]): Date | null {
  const times = items.map((i) => (i.updatedAt ? new Date(i.updatedAt).getTime() : Number.NaN)).filter((t) => !Number.isNaN(t));
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/** Urut peringkat: nilai terbesar dulu, belum diisi di akhir; nilai sama tetap urutan asal (sort stabil). */
export function compareStatValueDesc(a: StatBarItem, b: StatBarItem): number {
  if (a.value === null || b.value === null) return a.value === b.value ? 0 : a.value === null ? 1 : -1;
  return b.value - a.value;
}

function segmentTotalsOf(items: readonly StatBarItem[]): number[] | null {
  const withSegments = items.filter((i) => i.value !== null && i.segments && i.segments.length > 0);
  if (withSegments.length === 0) return null;
  const size = Math.max(...withSegments.map((i) => i.segments!.length));
  return Array.from({ length: size }, (_, k) => withSegments.reduce((sum, i) => sum + (i.segments![k] ?? 0), 0));
}

/**
 * Total, persen porsi, panjang batang, total per segmen, dan waktu pembaruan terakhir.
 * Urutan = urutan masukan kecuali `compare` diberikan. Baris ganda tidak digabung.
 */
export function summarizeStatBars<T extends StatBarItem>(
  items: readonly T[],
  options: { compare?: (a: T, b: T) => number } = {},
): StatBarsSummary<T> {
  const filled = items.map((i) => i.value).filter((n): n is number => n !== null);
  const total = filled.length > 0 ? filled.reduce((a, b) => a + b, 0) : null;
  const max = filled.length > 0 ? Math.max(...filled) : 0;
  const ordered = options.compare ? [...items].sort(options.compare) : [...items];
  const rows = ordered.map((item) => ({
    ...item,
    share: item.value !== null && total ? (item.value / total) * 100 : null,
    width: item.value !== null && max > 0 ? (item.value / max) * 100 : 0,
  }));
  return { rows, total, belumDiisi: items.length - filled.length, latest: latestUpdate(items), segmentTotals: segmentTotalsOf(items) };
}
