/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function ajukanIdeInovatifFindMany(context: Context) {
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
      { alamat: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.ajukanIdeInovatif.findMany({
        where: where,  // Use the where clause that includes search conditions
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ajukanIdeInovatif.count({
        where: where  // Also update the count query to use the same where clause
      })
    ]);

    return {
      success: true,
      message: "Success fetch ajukan ide inovatif with pagination",
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
      message: "Failed fetch ajukan ide inovatif with pagination",
    };
  }
}

export default ajukanIdeInovatifFindMany;
