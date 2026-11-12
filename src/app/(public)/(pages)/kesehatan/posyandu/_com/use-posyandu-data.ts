import { mapWithLimit, type BanjarStatsRow } from "./posyandu.logic";
import { BANJAR_STATS_CONCURRENCY } from "./posyandu.meta";
import { loadBanjarList, loadStats } from "./posyandu.source";

/**
 * Angka per banjar: daftar banjar lalu statistik tiap banjar (paling banyak BANJAR_STATS_CONCURRENCY bersamaan).
 * Banjar yang gagal tetap tampil sebagai baris `stats: null`; hanya kegagalan daftar banjar yang menggagalkan semuanya.
 */
export async function loadBanjarStats(): Promise<BanjarStatsRow[]> {
  const banjar = await loadBanjarList();
  return mapWithLimit(banjar, BANJAR_STATS_CONCURRENCY, async ({ id, name }) => {
    try {
      return { id, name, stats: await loadStats(id) };
    } catch (error) {
      console.error(`Gagal memuat statistik banjar ${id}:`, error);
      return { id, name, stats: null };
    }
  });
}
