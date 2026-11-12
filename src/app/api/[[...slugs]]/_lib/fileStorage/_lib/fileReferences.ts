import prisma from "@/lib/prisma";

/** Satu kolom FK yang merujuk `FileStorage.id`; identifier sudah di-quote oleh Postgres (`quote_ident`). */
export type FileForeignKey = { tabel: string; kolom: string };

let foreignKeysCache: Promise<FileForeignKey[]> | null = null;

/**
 * Semua kolom FK yang merujuk FileStorage, dibaca dari katalog Postgres (termasuk tabel relasi implisit
 * `_BeritaImages` dkk.) supaya relasi baru otomatis ikut dicek tanpa daftar manual. Di-cache per proses;
 * kegagalan tidak di-cache agar percobaan berikutnya membaca ulang.
 */
export function loadFileForeignKeys(): Promise<FileForeignKey[]> {
  if (!foreignKeysCache) {
    foreignKeysCache = prisma.$queryRaw<FileForeignKey[]>`
      SELECT quote_ident(ns.nspname) || '.' || quote_ident(cl.relname) AS tabel,
             quote_ident(a.attname) AS kolom
      FROM pg_constraint c
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_namespace ns ON ns.oid = cl.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
      WHERE c.contype = 'f' AND c.confrelid = to_regclass('"FileStorage"')
      ORDER BY 1, 2`.catch((error: unknown) => {
      foreignKeysCache = null;
      throw new Error(`Gagal membaca FK yang merujuk FileStorage: ${error instanceof Error ? error.message : String(error)}`);
    });
  }
  return foreignKeysCache;
}

/** Kosongkan cache FK (khusus test). */
export function resetFileForeignKeysCache(): void {
  foreignKeysCache = null;
}

/** SQL satu query: true bila ada baris di salah satu kolom FK yang menunjuk berkas `$1`. */
export function buildFileReferenceSql(foreignKeys: readonly FileForeignKey[]): string {
  const checks = foreignKeys.map((fk) => `EXISTS (SELECT 1 FROM ${fk.tabel} WHERE ${fk.kolom} = $1)`);
  return `SELECT (${checks.join(" OR ")}) AS dirujuk`;
}

/**
 * True bila berkas masih dirujuk baris mana pun (aktif maupun soft-delete) lewat FK. Setara dengan perilaku
 * lama: dulu `fileStorage.delete` gagal (FK RESTRICT) atau ikut menghapus data lain (CASCADE) — kini berkas
 * yang masih dipakai tidak dihapus permanen.
 */
export async function isFileReferenced(fileId: string): Promise<boolean> {
  const foreignKeys = await loadFileForeignKeys();
  if (foreignKeys.length === 0) return false;
  const rows = await prisma.$queryRawUnsafe<{ dirujuk: boolean }[]>(buildFileReferenceSql(foreignKeys), fileId);
  return rows[0]?.dirujuk === true;
}
