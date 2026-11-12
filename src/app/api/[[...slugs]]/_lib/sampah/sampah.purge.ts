import { sampahCutoff } from "@/lib/sampah/sampah-retensi";
import { SAMPAH_SOURCES } from "./sources";
import type { SampahSource } from "./sources/types";

/** Ukuran batch ID per query saat purge (tidak memuat seluruh Sampah ke memori). */
const SAMPAH_BATCH = 100;

/** Jalankan `fn` untuk setiap ID item sumber yang `deletedAt` < batas, dipaging per batch (cursor ID). */
async function forEachKedaluwarsa(source: SampahSource, deletedBefore: Date, fn: (id: string) => Promise<void>) {
  let afterId: string | undefined;
  for (;;) {
    const ids = await source.findIds(deletedBefore, SAMPAH_BATCH, afterId);
    for (const id of ids) await fn(id);
    if (ids.length < SAMPAH_BATCH) return;
    afterId = ids[ids.length - 1];
  }
}

/** Hapus permanen satu item; gagal/dilewati → false, error dicatat dengan konteks. */
export async function destroySafely(source: SampahSource, id: string): Promise<boolean> {
  try {
    return (await source.destroy(id)).ok;
  } catch (error) {
    console.error(`[sampah] Gagal hapus permanen ${source.key}:${id}:`, error);
    return false;
  }
}

/** Ringkasan purge: hanya jumlah (tanpa nama berkas/PII). */
export type PurgeSampahSummary = {
  dryRun: boolean;
  kedaluwarsa: number;
  dihapus: number;
  dilewati: number;
  perSumber: Record<string, { kedaluwarsa: number; dihapus: number; dilewati: number }>;
};

/**
 * Hapus permanen item 4 fitur koleksi yang `deletedAt` < now − retensi sumbernya (default 30 hari). `dryRun` hanya
 * menghitung. Dipanggil scheduler harian (`src/instrumentation.ts`); `now` bisa diinjeksi untuk test.
 */
export async function purgeSampah(
  { now = new Date(), dryRun = false }: { now?: Date; dryRun?: boolean } = {},
  sources: readonly SampahSource[] = SAMPAH_SOURCES,
): Promise<PurgeSampahSummary> {
  const summary: PurgeSampahSummary = { dryRun, kedaluwarsa: 0, dihapus: 0, dilewati: 0, perSumber: {} };
  for (const source of sources) {
    const stat = { kedaluwarsa: 0, dihapus: 0, dilewati: 0 };
    await forEachKedaluwarsa(source, sampahCutoff(now, source.retensiHari()), async (id) => {
      stat.kedaluwarsa += 1;
      if (dryRun) return;
      if (await destroySafely(source, id)) stat.dihapus += 1;
      else stat.dilewati += 1;
    });
    summary.perSumber[source.key] = stat;
    summary.kedaluwarsa += stat.kedaluwarsa;
    summary.dihapus += stat.dihapus;
    summary.dilewati += stat.dilewati;
  }
  console.info(
    `[sampah] Purge${dryRun ? " (dry run)" : ""} selesai: kedaluwarsa=${summary.kedaluwarsa} dihapus=${summary.dihapus} dilewati=${summary.dilewati}`,
  );
  return summary;
}
