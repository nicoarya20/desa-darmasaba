import { Prisma } from "@prisma/client";
import { loadJsonData } from "./load-json";

/** Isi file `*.retired.json`: daftar baris seed lama yang sudah dikeluarkan dari JSON aktif. */
export type RetiredSeedFile<T extends { id: string }> = { keterangan: string; data: T[] };

export type RetireSeedResult = { deleted: number; skipped: number; referenced: string[] };

/** Membaca daftar baris pensiun dari prisma/data. */
export function loadRetiredSeed<T extends { id: string }>(relativePath: string): T[] {
  return loadJsonData<RetiredSeedFile<T>>(relativePath).data;
}

/**
 * Menghapus baris seed lama yang id-nya sudah dipensiunkan.
 *
 * Seeder hanya upsert, jadi saat JSON diganti id baru, baris id lama tertinggal dan tampil dobel.
 * `deleteRow` wajib mencocokkan id + field penanda (nama/judul) supaya baris yang sudah diedit
 * admin tidak ikut terhapus. Baris yang masih dirujuk data lain (FK) dilewati, bukan dipaksa.
 */
export async function retireSeedRows<T extends { id: string }>(
  label: string,
  entries: T[],
  deleteRow: (entry: T) => PromiseLike<{ count: number }>,
): Promise<RetireSeedResult> {
  const result: RetireSeedResult = { deleted: 0, skipped: 0, referenced: [] };

  for (const entry of entries) {
    try {
      const { count } = await deleteRow(entry);
      if (count > 0) result.deleted += count;
      else result.skipped++; // sudah terhapus di seed sebelumnya, atau sudah diedit admin
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        result.referenced.push(entry.id);
        console.warn(`  ⚠️ ${label} ${entry.id} masih dirujuk data lain, tidak dihapus`);
        continue;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal menghapus ${label} pensiun ${entry.id}: ${message}`);
    }
  }

  console.log(
    `🧹 ${label} pensiun: ${result.deleted} dihapus, ${result.skipped} sudah tidak ada/diedit admin, ${result.referenced.length} masih dirujuk`,
  );
  return result;
}
