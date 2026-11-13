import type { SampahRow } from "@/lib/sampah/sampah-item";
import { SAMPAH_RETENSI_HARI } from "@/lib/sampah/sampah-retensi";
import { purgeStoredFile } from "../../fileStorage/_lib/purgeStoredFile";
import type { SampahActionResult, SampahListFilter, SampahSource } from "./types";

/** Berkas entitas (relasi FileStorage) sebagaimana dipilih adapter. */
export type EntityFile = NonNullable<SampahRow["file"]> & { id: string };

/** Baris entitas soft-delete yang dibaca adapter. */
export type EntityRow = Omit<SampahRow, "file"> & { file: EntityFile | null };

/** Operasi DB satu entitas koleksi (semua hanya menyentuh baris yang sedang soft-delete). */
export type EntityAdapter = {
  key: string;
  butuhScope: boolean;
  retensiHari?: () => number;
  count(filter: SampahListFilter): Promise<number>;
  list(filter: SampahListFilter, skip: number, take: number): Promise<EntityRow[]>;
  findIds(deletedBefore: Date, take: number, afterId?: string): Promise<string[]>;
  /** Baris di Sampah + id berkasnya; null bila tidak ada / masih aktif. */
  findTrashed(id: string): Promise<{ file: { id: string } | null } | null>;
  /** Hapus baris yang masih di Sampah; jumlah baris terhapus (0 = sudah tidak ada / aktif). */
  deleteTrashed(id: string): Promise<number>;
  restore(id: string, now: Date): Promise<SampahActionResult>;
};

const TIDAK_ADA: SampahActionResult = { ok: false, status: 404, message: "Item tidak ada di Sampah" };

/** Bungkus adapter entitas menjadi sumber Sampah: bentuk baris + hapus permanen berurutan aman. */
export function createEntitySource(adapter: EntityAdapter): SampahSource {
  return {
    key: adapter.key,
    butuhScope: adapter.butuhScope,
    retensiHari: adapter.retensiHari ?? (() => SAMPAH_RETENSI_HARI),
    count: (filter) => adapter.count(filter),

    async list(filter, skip, take) {
      const rows = await adapter.list(filter, skip, take);
      return rows.map(({ file, ...row }) => ({
        ...row,
        file: file ? { mimeType: file.mimeType, category: file.category, size: file.size, link: file.link } : null,
      }));
    },

    findIds: (deletedBefore, take, afterId) => adapter.findIds(deletedBefore, take, afterId),
    restore: (id, now) => adapter.restore(id, now),

    // Urutan aman (pola bug Maskot): baris entitas dulu, baru berkasnya — dan hanya bila tak dirujuk data lain
    // (mis. dokumen DAK yang disalin ke program lain memakai berkas yang sama).
    async destroy(id) {
      const trashed = await adapter.findTrashed(id);
      if (!trashed) return TIDAK_ADA;
      if ((await adapter.deleteTrashed(id)) === 0) return TIDAK_ADA;
      if (trashed.file) {
        try {
          await purgeStoredFile(trashed.file.id);
        } catch (error) {
          // Baris entitas sudah terhapus; berkas yang gagal dihapus tetap utuh (tidak ada link rusak).
          console.error(`[sampah] Gagal hapus permanen berkas ${trashed.file.id} milik ${adapter.key}:${id}:`, error);
        }
      }
      return { ok: true, message: "Item dihapus permanen" };
    },
  };
}
