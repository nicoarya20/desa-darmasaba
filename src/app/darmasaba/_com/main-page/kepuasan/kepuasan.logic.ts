import { JENIS_KELAMIN, KELOMPOK_UMUR, RATING, type Category } from "./kepuasan.meta";

type Named = { name?: string | null } | null | undefined;

/** Bentuk minimal satu responden dari `responden.findMany` (include jenisKelamin, rating, kelompokUmur). */
export type RespondenItem = {
  tanggal?: string | Date | null;
  createdAt?: string | Date | null;
  jenisKelamin?: Named;
  rating?: Named;
  kelompokUmur?: Named;
};

export type ChartSlice = { name: string; value: number; color: string };
export type MonthlyCount = { month: string; Responden: number };

export type KepuasanSummary = {
  jenisKelamin: ChartSlice[];
  rating: ChartSlice[];
  kelompokUmur: ChartSlice[];
  monthly: MonthlyCount[];
};

const lower = (v: Named) => v?.name?.toLowerCase();

/** Jumlah responden per kategori; nama dicocokkan tanpa beda huruf besar/kecil, nama lain diabaikan. */
export function countByCategory(
  data: readonly (RespondenItem | null)[],
  pick: (item: RespondenItem) => Named,
  categories: readonly Category[],
): ChartSlice[] {
  return categories.map(({ name, color }) => {
    const key = name.toLowerCase();
    const value = data.filter((item) => item !== null && lower(pick(item)) === key).length;
    return { name, value, color };
  });
}

/** Jumlah responden per bulan (pakai `tanggal`, jatuh ke `createdAt`), urut kronologis, label "Maret 2026". */
export function monthlyCounts(data: readonly (RespondenItem | null)[]): MonthlyCount[] {
  const counts = new Map<number, number>();

  for (const item of data) {
    const raw = item?.tanggal || item?.createdAt;
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.getFullYear() * 100 + date.getMonth() + 1;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a - b)
    .map(([key, Responden]) => {
      const year = Math.floor(key / 100);
      const monthName = new Date(year, (key % 100) - 1, 1).toLocaleString("id-ID", { month: "long" });
      return { month: `${monthName} ${year}`, Responden };
    });
}

/** Semua data grafik section dari daftar responden (null → dianggap kosong). */
export function summarizeKepuasan(data: readonly (RespondenItem | null)[] | null | undefined): KepuasanSummary {
  const list = data ?? [];
  return {
    jenisKelamin: countByCategory(list, (r) => r.jenisKelamin, JENIS_KELAMIN),
    rating: countByCategory(list, (r) => r.rating, RATING),
    kelompokUmur: countByCategory(list, (r) => r.kelompokUmur, KELOMPOK_UMUR),
    monthly: monthlyCounts(list),
  };
}

/** True bila minimal satu kategori bernilai > 0. */
export function hasValues(slices: readonly ChartSlice[]): boolean {
  return slices.some((s) => s.value > 0);
}

export type SelectOption = { value: string; label: string };

/** Opsi `Select` dari daftar opsi API: buang entri kosong, nama kosong → `fallbackLabel`. */
export function toSelectOptions(
  list: readonly ({ id: string; name?: string | null } | null | undefined)[] | null | undefined,
  fallbackLabel: string,
): SelectOption[] {
  return (list ?? [])
    .filter((item): item is { id: string; name?: string | null } => Boolean(item))
    .map((item) => ({ value: item.id, label: item.name || fallbackLabel }));
}
