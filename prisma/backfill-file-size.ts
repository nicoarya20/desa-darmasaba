/**
 * Backfill FileStorage.size dari MinIO untuk baris lama (size NULL). Idempoten, aman diulang.
 * Jalankan (operator, sekali setelah migrasi 20261109150000_add_file_storage_size):
 *   bun run backfill:file-size
 */
import prisma from "@/lib/prisma";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { backfillFileSizes } from "@/lib/file-storage-backfill";

async function main() {
  if (!MINIO_BUCKET) throw new Error("MINIO_BUCKET belum diset — backfill ukuran berkas dibatalkan");
  const result = await backfillFileSizes({
    db: prisma.fileStorage,
    storage: minio,
    bucket: MINIO_BUCKET,
    log: (message) => console.info(`[backfill-file-size] ${message}`),
  });
  console.info(`[backfill-file-size] selesai: sukses=${result.updated} gagal=${result.failed}`);
  if (result.failed > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(`[backfill-file-size] berhenti: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
