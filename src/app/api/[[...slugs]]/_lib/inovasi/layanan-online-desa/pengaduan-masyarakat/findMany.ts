// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function pengaduanMasyarakatFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.pengaduanMasyarakat.findMany({
        where: { isActive: true },
        include: {
          jenisPengaduan: true,
          image: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.pengaduanMasyarakat.count({
        where: { isActive: true }
      })
    ]);

    return {
      success: true,
      message: "Success fetch pengaduan masyarakat with pagination",
      data,
      page,
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
