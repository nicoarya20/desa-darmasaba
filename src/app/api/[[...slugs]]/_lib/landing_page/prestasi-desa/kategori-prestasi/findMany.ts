/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function kategoriPrestasiFindMany(context: Context) {
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
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.kategoriPrestasiDesa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.kategoriPrestasiDesa.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch Kategori Prestasi Desa with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch Kategori Prestasi Desa with pagination",
    };
  }
}

export default kategoriPrestasiFindMany;
