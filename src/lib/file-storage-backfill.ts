// Inti backfill FileStorage.size — klien DB & MinIO di-inject supaya bisa diuji tanpa I/O nyata.
// Dijalankan operator lewat prisma/backfill-file-size.ts (lihat docs/DEPLOYMENT.md).
import { resolveStoredSize, type StorageReader, type StoredFileRef } from "./file-storage-size";

export const BACKFILL_DEFAULT_BATCH_SIZE = 100;

type BackfillRow = StoredFileRef & { id: string };

/** Bagian Prisma `fileStorage` yang dipakai backfill. */
export type BackfillDb = {
  findMany(args: {
    where: { size: null; id?: { gt: string } };
    orderBy: { id: "asc" };
    take: number;
    select: { id: true; path: true; name: true; mimeType: true };
  }): Promise<BackfillRow[]>;
  update(args: { where: { id: string }; data: { size: number } }): Promise<unknown>;
};

export type BackfillResult = { updated: number; failed: number; failedIds: string[] };

export type BackfillOptions = {
  db: BackfillDb;
  storage: StorageReader;
  bucket: string;
  batchSize?: number;
  /** Ringkasan per batch / per kegagalan (hanya id & kode error, tanpa data pengguna). */
  log?: (message: string) => void;
};

/**
 * Isi `size` untuk semua FileStorage yang masih NULL, per batch berurut id (cursor `id > terakhir`
 * supaya baris yang gagal tidak diambil ulang tanpa henti). Idempoten: baris yang sudah terisi tidak
 * disentuh. Error MinIO satu berkas dicatat lalu lanjut ke berkas berikutnya.
 */
export async function backfillFileSizes(opts: BackfillOptions): Promise<BackfillResult> {
  const { db, storage, bucket, log = () => {} } = opts;
  const batchSize = opts.batchSize ?? BACKFILL_DEFAULT_BATCH_SIZE;
  const result: BackfillResult = { updated: 0, failed: 0, failedIds: [] };
  let lastId: string | undefined;

  for (;;) {
    const rows = await db.findMany({
      where: lastId ? { size: null, id: { gt: lastId } } : { size: null },
      orderBy: { id: "asc" },
      take: batchSize,
      select: { id: true, path: true, name: true, mimeType: true },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      try {
        const size = await resolveStoredSize(storage, bucket, row);
        await db.update({ where: { id: row.id }, data: { size } });
        result.updated += 1;
      } catch (err) {
        // Sengaja tidak menghentikan backfill: satu objek hilang/rusak tidak boleh memblok sisanya.
        result.failed += 1;
        result.failedIds.push(row.id);
        const code = (err as { code?: string })?.code ?? (err instanceof Error ? err.name : "unknown");
        log(`gagal id=${row.id} (${code})`);
      }
    }
    lastId = rows[rows.length - 1].id;
    log(`batch selesai: ${rows.length} baris, total sukses=${result.updated} gagal=${result.failed}`);
  }

  return result;
}
