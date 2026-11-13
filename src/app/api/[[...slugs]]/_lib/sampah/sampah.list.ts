import { toSampahItem, type SampahListData } from "@/lib/sampah/sampah-item";
import type { SampahListQuery } from "@/lib/sampah/sampah-query";
import { sampahCutoff } from "@/lib/sampah/sampah-retensi";
import type { SampahSource } from "./sources/types";

/**
 * Daftar Sampah satu sumber: terbaru dihapus dulu, dipaging di DB, hanya item yang belum melewati retensi.
 * `scopeId` hanya dipakai sumber ber-scope (handler sudah memastikan terisi); sumber lain mengabaikannya.
 */
export async function listSampah(source: SampahSource, { page, limit, scopeId, now }: SampahListQuery & { now: Date }): Promise<SampahListData> {
  const retensiHari = source.retensiHari();
  const filter = { scopeId: source.butuhScope ? scopeId : null, deletedAfter: sampahCutoff(now, retensiHari) };
  const [total, rows] = await Promise.all([source.count(filter), source.list(filter, (page - 1) * limit, limit)]);
  return { items: rows.map((row) => toSampahItem(row, now, retensiHari)), total, page, limit, retensiHari };
}
