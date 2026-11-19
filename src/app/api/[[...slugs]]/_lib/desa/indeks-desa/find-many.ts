import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import type { Prisma } from "@prisma/client";
import { INDEKS_DESA_DEFAULT_LIMIT, INDEKS_DESA_MAX_LIMIT } from "@/lib/indeks-desa";

/** Kolom Indeks Desa yang dikirim ke klien (tanpa kolom bookkeeping createdAt/updatedAt/deletedAt/isActive). */
export const INDEKS_DESA_SELECT = {
  id: true,
  tahun: true,
  skorIdm: true,
  skorIks: true,
  skorIke: true,
  skorIkl: true,
  status: true,
  catatan: true,
} as const;

/** Filter baris yang tampil: aktif dan belum dihapus. */
export const INDEKS_DESA_AKTIF = { isActive: true, deletedAt: null } as const;

/** Urutan daftar: tahun terbaru dulu. */
export const INDEKS_DESA_ORDER_BY: Prisma.IndeksDesaOrderByWithRelationInput[] = [{ tahun: "desc" }];

/** Bilangan bulat positif dari query string; bukan angka valid → `fallback`. */
function positiveInt(raw: unknown, fallback: number): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

/** GET publik daftar Indeks Desa aktif, tahun menurun, paginasi `page`/`limit` (limit dibatasi 100). Mengembalikan data + total. */
export default async function indeksDesaFindMany(context: Context) {
  const query = context.query as Record<string, unknown>;
  const page = positiveInt(query.page, 1);
  const limit = Math.min(INDEKS_DESA_MAX_LIMIT, positiveInt(query.limit, INDEKS_DESA_DEFAULT_LIMIT));

  try {
    const [data, total] = await Promise.all([
      prisma.indeksDesa.findMany({
        where: INDEKS_DESA_AKTIF,
        orderBy: INDEKS_DESA_ORDER_BY,
        skip: (page - 1) * limit,
        take: limit,
        select: INDEKS_DESA_SELECT,
      }),
      prisma.indeksDesa.count({ where: INDEKS_DESA_AKTIF }),
    ]);
    return { success: true, data, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  } catch (error) {
    console.error("Gagal mengambil daftar Indeks Desa:", error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil daftar Indeks Desa" };
  }
}
