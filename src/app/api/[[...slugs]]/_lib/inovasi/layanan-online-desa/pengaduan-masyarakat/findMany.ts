/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function pengaduanMasyarakatFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { judulPengaduan: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.pengaduanMasyarakat.findMany({
        where: where,
        include: {
          jenisPengaduan: true,
          image: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.pengaduanMasyarakat.count({
        where: where
      })
    ]);

    return {
      success: true,
      message: "Success fetch pengaduan masyarakat with pagination",
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch pengaduan masyarakat with pagination",
    };
  }
}

export default pengaduanMasyarakatFindMany;
