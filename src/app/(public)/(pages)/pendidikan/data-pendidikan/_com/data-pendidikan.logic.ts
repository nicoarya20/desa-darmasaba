import { compareJenjang } from "@/lib/jenjang-pendidikan-urutan";

/** Satu kategori pendidikan yang sudah dinormalkan dari respons API. */
export type DataPendidikanItem = {
  id: string;
  nama: string;
  /** null = isian admin kosong atau bukan bilangan bulat (kolom `jumlah` di DB bertipe teks bebas). */
  jumlah: number | null;
  updatedAt: string | null;
};

/** Baris siap tampil: porsi dari total (persen) dan panjang batang relatif ke jenjang terbanyak. */
export type DataPendidikanRow = DataPendidikanItem & {
  share: number | null;
  /** 0–100; panjang batang terhadap nilai terbesar. */
  width: number;
};

export type DataPendidikanSummary = {
  rows: DataPendidikanRow[];
  /** Jumlah seluruh baris yang terisi; null bila tak satu pun terisi. */
  total: number | null;
  /** Banyaknya baris yang jumlahnya belum diisi / tidak terbaca. */
  belumDiisi: number;
  latest: Date | null;
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

/** Urut jenjang baku (PAUD, TK, SD, SMP, SMA, SMK, lalu lainnya A–Z); nama sama tetap berurutan seperti dari API. */
export function sortByJenjang<T extends { nama: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => compareJenjang(a.nama, b.nama));
}

function latestOf(items: readonly DataPendidikanItem[]): Date | null {
  const times = items.map((i) => (i.updatedAt ? new Date(i.updatedAt).getTime() : Number.NaN)).filter((t) => !Number.isNaN(t));
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/** Total, persen porsi, panjang batang, dan waktu pembaruan terakhir. Baris ganda tidak digabung. */
export function summarizeDataPendidikan(items: readonly DataPendidikanItem[]): DataPendidikanSummary {
  const filled = items.map((i) => i.jumlah).filter((n): n is number => n !== null);
  const total = filled.length > 0 ? filled.reduce((a, b) => a + b, 0) : null;
  const max = filled.length > 0 ? Math.max(...filled) : 0;
  const rows = sortByJenjang(items).map((item) => ({
    ...item,
    share: item.jumlah !== null && total ? (item.jumlah / total) * 100 : null,
    width: item.jumlah !== null && max > 0 ? (item.jumlah / max) * 100 : 0,
  }));
  return { rows, total, belumDiisi: items.length - filled.length, latest: latestOf(items) };
}

/** Bilangan bulat gaya Indonesia: `1.906`. */
export function formatJumlah(value: number): string {
  return value.toLocaleString("id-ID");
}
