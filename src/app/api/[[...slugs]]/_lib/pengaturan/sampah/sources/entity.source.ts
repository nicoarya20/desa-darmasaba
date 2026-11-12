import { kelompokIdOfMenu, SAMPAH_KELOMPOK_SEMUA } from "@/lib/sampah/sampah-kelompok";
import { SAMPAH_RETENSI_HARI } from "@/lib/sampah/sampah-retensi";
import { purgeStoredFile } from "../../../fileStorage/_lib/purgeStoredFile";
import type { ServableFile } from "../../../fileStorage/_lib/serveStoredFile";
import type { SampahActionResult, SampahSource } from "./types";

/** Berkas entitas (relasi FileStorage) sebagaimana dipilih adapter. */
export type EntityFile = ServableFile & { id: string; category: string; size: number | null };

/** Baris entitas soft-delete yang dibaca adapter. */
export type EntityRow = { id: string; judul: string; deletedAt: Date; file: EntityFile | null };

/** Operasi DB satu entitas koleksi (semua hanya menyentuh baris yang sedang soft-delete). */
export type EntityAdapter = {
  key: string;
  /** ID submenu sidebar pemilik entitas (menentukan kelompok). */
  menuId: string;
  retensiHari?: () => number;
  count(cari: string): Promise<number>;
  list(cari: string, take: number): Promise<EntityRow[]>;
  findIds(deletedBefore: Date | undefined, take: number, afterId?: string): Promise<string[]>;
  /** Baris di Sampah + berkasnya; null bila tidak ada / masih aktif. */
  findTrashed(id: string): Promise<{ file: EntityFile | null } | null>;
  /** Hapus baris yang masih di Sampah; jumlah baris terhapus (0 = sudah tidak ada / aktif). */
  deleteTrashed(id: string): Promise<number>;
  restore(id: string, now: Date): Promise<SampahActionResult>;
};

const TIDAK_ADA: SampahActionResult = { ok: false, status: 404, message: "Dokumen tidak ada di Sampah" };

/** Bungkus adapter entitas menjadi sumber Sampah: filter kelompok, bentuk baris, hapus permanen berurutan aman. */
export function createEntitySource(adapter: EntityAdapter): SampahSource {
  const kelompokId = kelompokIdOfMenu(adapter.menuId);
  const cocok = (kelompok: string) => kelompok === SAMPAH_KELOMPOK_SEMUA || kelompok === kelompokId;

  return {
    key: adapter.key,
    retensiHari: adapter.retensiHari ?? (() => SAMPAH_RETENSI_HARI),

    async countByKelompok(cari) {
      return { [kelompokId]: await adapter.count(cari) };
    },

    async list({ kelompok, cari }, take) {
      if (!cocok(kelompok)) return [];
      const rows = await adapter.list(cari, take);
      return rows.map((r) => ({
        sumber: adapter.key,
        id: r.id,
        jenis: "dokumen" as const,
        judul: r.judul,
        deletedAt: r.deletedAt,
        menuId: adapter.menuId,
        file: r.file ? { mimeType: r.file.mimeType, category: r.file.category, size: r.file.size } : null,
      }));
    },

    findIds({ kelompok, deletedBefore }, take, afterId) {
      return cocok(kelompok) ? adapter.findIds(deletedBefore, take, afterId) : Promise.resolve([]);
    },

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
          // Baris entitas sudah terhapus; berkas yang gagal dihapus tetap aktif (tidak ada link rusak).
          console.error(`[sampah] Gagal hapus permanen berkas ${trashed.file.id} milik ${adapter.key}:${id}:`, error);
        }
      }
      return { ok: true, message: "Dokumen dihapus permanen" };
    },

    async previewFile(id) {
      const trashed = await adapter.findTrashed(id);
      return trashed?.file ?? null;
    },
  };
}
