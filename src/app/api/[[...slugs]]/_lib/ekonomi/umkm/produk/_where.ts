import type { Prisma } from "@prisma/client";

export type ProdukListQuery = {
  search?: string;
  umkmId?: string;
  kategoriId?: string;
  unggulan?: string;
};

/** Hanya nilai literal "true" yang mengaktifkan filter unggulan; selain itu perilaku lama (semua produk). */
export function isUnggulanFilter(value: unknown): boolean {
  return value === "true";
}

/** Susun where list produk UMKM publik: hanya aktif, belum dihapus, plus filter opsional. */
export function buildProdukWhere(query: ProdukListQuery): Prisma.PasarDesaWhereInput {
  const where: Prisma.PasarDesaWhereInput = {
    deletedAt: null,
    isActive: true,
  };

  if (query.umkmId) where.umkmId = query.umkmId;
  if (query.kategoriId) where.kategoriProdukId = query.kategoriId;
  if (query.search) where.nama = { contains: query.search, mode: "insensitive" };
  if (isUnggulanFilter(query.unggulan)) where.isUnggulan = true;

  return where;
}
