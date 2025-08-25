/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function prestasiDesaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = {};

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } },
      { kategori: { name: { contains: search, mode: 'insensitive' } } },
    ];
    // Tetap filter hanya yang aktif saat melakukan pencarian
    where.isActive = true;
  } else {
    // Jika tidak ada pencarian, tampilkan hanya data yang aktif
    where.isActive = true;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.prestasiDesa.findMany({
        where,
        include: {
          image: true,
          kategori: {
            select: {
              id: true,
              name: true
            }
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.prestasiDesa.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch Prestasi Desa with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch Prestasi Desa with pagination",
    };
  }
}

export default prestasiDesaFindMany;
