// Potongan query Prisma bersama untuk adapter entitas Sampah.
import type { SampahListFilter } from "./types";

/** Baris entitas yang sedang di Sampah (soft delete). */
export const TRASHED_WHERE = { isActive: false, deletedAt: { not: null } } as const;

/** Field berkas yang dibutuhkan item Sampah (pratinjau = link) dan hapus permanen (id). */
export const ENTITY_FILE_SELECT = {
  select: { id: true, mimeType: true, category: true, size: true, link: true },
} as const;

/** Urutan daftar: terbaru dihapus dulu, seri stabil per ID. */
export const TRASHED_ORDER_BY = [{ deletedAt: "desc" }, { id: "asc" }] as const;

/** Filter daftar: di Sampah, belum melewati retensi, dan (bila ada) milik scope `scopeField`. */
export function listWhere({ scopeId, deletedAfter }: SampahListFilter, scopeField?: string) {
  return {
    isActive: false,
    deletedAt: { gt: deletedAfter },
    ...(scopeField && scopeId ? { [scopeField]: scopeId } : {}),
  };
}

/** Filter ID untuk purge: di Sampah dengan `deletedAt` < batas (eksklusif) + cursor ID. */
export function idPageWhere(deletedBefore: Date, afterId: string | undefined) {
  return {
    isActive: false,
    deletedAt: { lt: deletedBefore },
    ...(afterId ? { id: { gt: afterId } } : {}),
  };
}
