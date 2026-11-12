// Potongan query Prisma bersama untuk adapter entitas Sampah.

/** Baris entitas yang sedang di Sampah (soft delete). */
export const TRASHED_WHERE = { isActive: false, deletedAt: { not: null } } as const;

/** Field berkas yang dibutuhkan item Sampah, pratinjau, dan hapus permanen. */
export const ENTITY_FILE_SELECT = {
  select: { id: true, path: true, name: true, mimeType: true, category: true, size: true },
} as const;

/** Urutan daftar: terbaru dihapus dulu, seri stabil per ID. */
export const TRASHED_ORDER_BY = [{ deletedAt: "desc" }, { id: "asc" }] as const;

/** Filter ID untuk kosongkan/purge: batas `deletedAt` (eksklusif) + cursor ID. */
export function idPageWhere(deletedBefore: Date | undefined, afterId: string | undefined) {
  return {
    ...TRASHED_WHERE,
    ...(deletedBefore ? { deletedAt: { lt: deletedBefore } } : {}),
    ...(afterId ? { id: { gt: afterId } } : {}),
  };
}

/** Filter judul (case-insensitive); kosong = tanpa filter. */
export function judulContains(cari: string) {
  return cari ? { judul: { contains: cari, mode: "insensitive" as const } } : {};
}
