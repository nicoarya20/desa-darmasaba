/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function respondenFindMany(context: Context) {
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
      { tanggal: { contains: search, mode: 'insensitive' } },
      { jenisKelamin: { name: { contains: search, mode: 'insensitive' } } },
      { rating: { name: { contains: search, mode: 'insensitive' } } },
      { kelompokUmur: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.responden.findMany({
        where,
        include: {
          jenisKelamin: true,
          rating: true,
          kelompokUmur: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.responden.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil responden dengan pagination",
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
      message: "Gagal mengambil data responden",
    };
  }
}

export default respondenFindMany;