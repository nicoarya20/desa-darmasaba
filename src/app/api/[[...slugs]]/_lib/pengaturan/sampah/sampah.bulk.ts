import { SAMPAH_KELOMPOK_SEMUA } from "@/lib/sampah/sampah-kelompok";
import { sampahCutoff } from "@/lib/sampah/sampah-retensi";
import { SAMPAH_SOURCES } from "./sources";
import type { SampahIdQuery, SampahSource } from "./sources/types";

/** Ukuran batch ID per query saat kosongkan/purge (tidak memuat seluruh Sampah ke memori). */
const SAMPAH_BATCH = 100;

/** Jalankan `fn` untuk setiap ID item sumber yang cocok, dipaging per batch (cursor ID). */
async function forEachSampahId(source: SampahSource, query: SampahIdQuery, fn: (id: string) => Promise<void>) {
  let afterId: string | undefined;
  for (;;) {
    const ids = await source.findIds(query, SAMPAH_BATCH, afterId);
    for (const id of ids) await fn(id);
    if (ids.length < SAMPAH_BATCH) return;
    afterId = ids[ids.length - 1];
  }
}

/** Hapus permanen satu item; gagal/dilewati (mis. berkas masih dirujuk) → false, error dicatat dengan konteks. */
async function destroySafely(source: SampahSource, id: string): Promise<boolean> {
  try {
    return (await source.destroy(id)).ok;
  } catch (error) {
    console.error(`[sampah] Gagal hapus permanen ${source.key}:${id}:`, error);
    return false;
  }
}

/** Kosongkan Sampah satu kelompok (atau "semua"): hapus permanen semua item tanpa melihat umur. */
export async function kosongkanSampah(kelompok: string, sources: readonly SampahSource[] = SAMPAH_SOURCES) {
  let dihapus = 0;
  let dilewati = 0;
  for (const source of sources) {
    await forEachSampahId(source, { kelompok }, async (id) => {
      if (await destroySafely(source, id)) dihapus += 1;
      else dilewati += 1;
    });
  }
  return { dihapus, dilewati };
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
 * Hapus permanen item yang `deletedAt` < now − retensi sumbernya (default 30 hari). `dryRun` hanya menghitung.
 * Dipanggil scheduler harian (`src/instrumentation.ts`); `now` bisa diinjeksi untuk test.
 */
export async function purgeSampah(
  { now = new Date(), dryRun = false }: { now?: Date; dryRun?: boolean } = {},
  sources: readonly SampahSource[] = SAMPAH_SOURCES,
): Promise<PurgeSampahSummary> {
  const summary: PurgeSampahSummary = { dryRun, kedaluwarsa: 0, dihapus: 0, dilewati: 0, perSumber: {} };
  for (const source of sources) {
    const stat = { kedaluwarsa: 0, dihapus: 0, dilewati: 0 };
    const query = { kelompok: SAMPAH_KELOMPOK_SEMUA, deletedBefore: sampahCutoff(now, source.retensiHari()) };
    await forEachSampahId(source, query, async (id) => {
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
