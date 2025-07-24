// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function prestasiDesaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.prestasiDesa.findMany({
        where: { isActive: true },
        include: {
          image: true,
          kategori: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.prestasiDesa.count({
        where: { isActive: true },
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
