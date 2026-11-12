import { compareSampahRows, toSampahItem, type SampahItem } from "@/lib/sampah/sampah-item";
import { SAMPAH_KELOMPOK_SEMUA, sampahKelompokList, type SampahKelompok } from "@/lib/sampah/sampah-kelompok";
import { SAMPAH_SOURCES } from "./sources";
import type { SampahSource } from "./sources/types";

/** Data respons `GET /api/pengaturan/sampah` (kontrak API). */
export type SampahListData = {
  items: SampahItem[];
  counts: { semua: number; [kelompokId: string]: number };
  kelompok: SampahKelompok[];
  page: number;
  limit: number;
  total: number;
};

export type SampahListParams = { kelompok: string; page: number; limit: number; cari: string; now: Date };

/** Hitung jumlah per kelompok (semua kelompok selalu ada, 0 bila kosong) dari hitungan DB tiap sumber. */
export async function countSampah(cari: string, sources: readonly SampahSource[] = SAMPAH_SOURCES) {
  const counts: SampahListData["counts"] = { semua: 0 };
  for (const k of sampahKelompokList()) counts[k.id] = 0;
  const perSource = await Promise.all(sources.map((s) => s.countByKelompok(cari)));
  for (const perKelompok of perSource) {
    for (const [kelompokId, n] of Object.entries(perKelompok)) {
      counts[kelompokId] = (counts[kelompokId] ?? 0) + n;
      counts.semua += n;
    }
  }
  return counts;
}

/**
 * Daftar Sampah terbaru dihapus dulu, dipaging lintas sumber: tiap sumber mengambil maks `page × limit` baris
 * teratas dari DB, digabung, lalu diiris. Jumlah per kelompok dihitung di DB (count/groupBy), bukan di memori.
 */
export async function listSampah(params: SampahListParams, sources: readonly SampahSource[] = SAMPAH_SOURCES): Promise<SampahListData> {
  const { kelompok, page, limit, cari, now } = params;
  const skip = (page - 1) * limit;
  const take = skip + limit;

  const [counts, rowsPerSource] = await Promise.all([
    countSampah(cari, sources),
    Promise.all(sources.map((s) => s.list({ kelompok, cari }, take))),
  ]);

  const retensi = new Map(sources.map((s) => [s.key, s.retensiHari()]));
  const items = rowsPerSource
    .flat()
    .sort(compareSampahRows)
    .slice(skip, take)
    .map((row) => toSampahItem(row, now, retensi.get(row.sumber) as number));

  const total = kelompok === SAMPAH_KELOMPOK_SEMUA ? counts.semua : (counts[kelompok] ?? 0);
  return { items, counts, kelompok: sampahKelompokList(), page, limit, total };
}
