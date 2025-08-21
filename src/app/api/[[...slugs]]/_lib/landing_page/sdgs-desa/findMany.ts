/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function sdgsDesaFindMany(context: Context) {
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
      prisma.sDGSDesa.findMany({
        where,
        include: {
          image: true,
        },
        skip,
        take: limit,
        orderBy: { jumlah: "desc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.sDGSDesa.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch SDGS Desa with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch SDGS Desa with pagination",
    };
  }
}

export default sdgsDesaFindMany;
