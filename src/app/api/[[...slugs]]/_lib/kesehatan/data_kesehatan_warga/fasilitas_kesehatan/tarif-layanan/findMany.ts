/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function tarifLayananFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { layanan: { contains: search, mode: 'insensitive' } },
      { tarif: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.tarifDanLayanan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { layanan: 'asc' },
      }),
      prisma.tarifDanLayanan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data tarif layanan dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data tarif layanan",
    };
  }
}

export default tarifLayananFindMany;