import { parseJumlah, type StatBarItem } from "@/app/(public)/_com/stat-bars/stat-bars.logic";

/** Singkatan bulan persis seperti disimpan admin (`DetailDataPengangguran.month`), urut kalender. */
export const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"] as const;
const BULAN_PANJANG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

/** Bentuk satu baris find-many `jumlahpengangguran/detaildatapengangguran` (field yang dibaca saja). */
export type PengangguranBulanApi = {
  id: string;
  month: string;
  year: number | string;
  totalUnemployment?: number | string | null;
  educatedUnemployment?: number | string | null;
  uneducatedUnemployment?: number | string | null;
  updatedAt?: string | null;
};

/** Satu bulan data pengangguran. `bulan` = indeks 0–11. Total = terdidik + tidak terdidik (form admin menghitungnya begitu). */
export type PengangguranBulan = {
  id: string;
  tahun: number;
  bulan: number;
  terdidik: number;
  tidakTerdidik: number;
  total: number;
  updatedAt: string | null;
};

/** Perubahan jumlah dibanding bulan kalender sebelumnya (bukan sekadar baris sebelumnya di daftar). */
export type Perubahan = { selisih: number; persen: number | null; dari: PengangguranBulan };

/** Baris API → bulan; bulan/tahun/angka tak terbaca → null (dibuang, tidak ditebak). */
export function toPengangguranBulan(raw: PengangguranBulanApi): PengangguranBulan | null {
  const bulan = BULAN.indexOf(raw.month as (typeof BULAN)[number]);
  const tahun = Number(raw.year);
  const terdidik = parseJumlah(raw.educatedUnemployment);
  const tidakTerdidik = parseJumlah(raw.uneducatedUnemployment);
  if (bulan < 0 || !Number.isInteger(tahun) || terdidik === null || tidakTerdidik === null) return null;
  const total = parseJumlah(raw.totalUnemployment) ?? terdidik + tidakTerdidik;
  return { id: raw.id, tahun, bulan, terdidik, tidakTerdidik, total, updatedAt: raw.updatedAt ?? null };
}

const periode = (row: Pick<PengangguranBulan, "tahun" | "bulan">) => row.tahun * 12 + row.bulan;

/** Urut kalender naik (API mengurut tahun lalu mengacak bulan antar-tahun, jadi selalu diurut ulang di sini). */
export function sortBulan(rows: readonly PengangguranBulan[]): PengangguranBulan[] {
  return [...rows].sort((a, b) => periode(a) - periode(b));
}

/** Bulan dengan periode terbesar (data uji tahun jauh ikut dihitung, sesuai keputusan "tampil apa adanya"). */
export function pickLatestBulan(rows: readonly PengangguranBulan[]): PengangguranBulan | null {
  return rows.reduce<PengangguranBulan | null>((best, row) => (best === null || periode(row) > periode(best) ? row : best), null);
}

/** Perubahan terhadap bulan kalender tepat sebelumnya; null bila bulan itu tidak tercatat. */
export function perubahanBulan(rows: readonly PengangguranBulan[], row: PengangguranBulan): Perubahan | null {
  const dari = rows.find((r) => periode(r) === periode(row) - 1);
  if (!dari) return null;
  const selisih = row.total - dari.total;
  return { selisih, persen: dari.total > 0 ? (selisih / dari.total) * 100 : null, dari };
}

/** Tahun yang punya data, terbaru dulu (untuk pemilih tahun). */
export function tahunTersedia(rows: readonly PengangguranBulan[]): number[] {
  return [...new Set(rows.map((r) => r.tahun))].sort((a, b) => b - a);
}

/** Bulan-bulan satu tahun, urut Jan → Des. */
export function bulanDalamTahun(rows: readonly PengangguranBulan[], tahun: number): PengangguranBulan[] {
  return sortBulan(rows.filter((r) => r.tahun === tahun));
}

/** Porsi bagian dari total dalam persen; null bila total 0. */
export function porsi(bagian: number, total: number): number | null {
  return total > 0 ? (bagian / total) * 100 : null;
}

/** `Februari 2026`. */
export const namaPeriode = (row: Pick<PengangguranBulan, "tahun" | "bulan">) => `${BULAN_PANJANG[row.bulan]} ${row.tahun}`;

// ---------- Sebaran (halaman Usia Kerja yang Menganggur) ----------

/** Satu baris model sebaran (usia/pendidikan) dalam bentuk panel stat-bars; `value` null = isian bukan bilangan bulat. */
export type Sebaran = { id: string; updatedAt: string | null; items: StatBarItem[] };

type SebaranRaw = Record<string, unknown> & { id: string; updatedAt?: string | null; createdAt?: string | null };
type Kolom = readonly { key: string; label: string }[];

/** Baris model sebaran (kolom teks per kelompok) → butir stat-bars berurutan sesuai `kolom` (urutan usia/jenjang, bukan peringkat). */
export function toSebaran(raw: SebaranRaw, kolom: Kolom): Sebaran {
  const updatedAt = (raw.updatedAt ?? raw.createdAt ?? null) as string | null;
  return {
    id: raw.id,
    updatedAt,
    items: kolom.map(({ key, label }) => ({ id: `${raw.id}-${key}`, label, value: parseJumlah(raw[key]), updatedAt })),
  };
}

/**
 * Model sebaran tanpa periode dan admin boleh menambah banyak baris: yang tampil hanya baris yang terakhir diperbarui
 * (keputusan user 2026-11-16), bukan jumlah semua baris (menghitung ganda bila admin mengisi ulang).
 */
export function pickLatestSebaran<T extends SebaranRaw>(rows: readonly T[]): T | null {
  const time = (r: SebaranRaw) => new Date((r.updatedAt ?? r.createdAt ?? "") as string).getTime() || 0;
  return rows.reduce<T | null>((best, row) => (best === null || time(row) > time(best) ? row : best), null);
}

/** Arah perubahan untuk ikon panah netral (tanpa warna merah/hijau: naik/turun pengangguran bukan penilaian halaman). */
export function arahPerubahan(selisih: number): "naik" | "turun" | "tetap" {
  return selisih > 0 ? "naik" : selisih < 0 ? "turun" : "tetap";
}
