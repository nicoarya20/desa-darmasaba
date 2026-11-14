import prisma from "@/lib/prisma";
import { parsePagination } from "@/lib/dinamika-penduduk";
import { Context } from "elysia";

/** Daftar dinamika per tahun, terbaru dulu, dengan pagination. */
export default async function dinamikaPendudukFindMany(context: Context) {
  const { page, limit, skip } = parsePagination(context.query.page, context.query.limit);
  const where = { isActive: true };

  try {
    const [data, total] = await Promise.all([
      prisma.dinamikaPenduduk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tahun: "desc" },
        select: { id: true, tahun: true, kelahiran: true, kematian: true, masuk: true, keluar: true },
      }),
      prisma.dinamikaPenduduk.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data dinamika penduduk",
      data,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      total,
    };
  } catch (error) {
    throw new Error(`Gagal mengambil daftar dinamika penduduk (page ${page}): ${(error as Error).message}`);
  }
}
