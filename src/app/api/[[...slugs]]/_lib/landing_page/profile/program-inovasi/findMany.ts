// // /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function programInovasiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.programInovasi.findMany({
        where: { isActive: true },
        include: {
          image: true,
        },
        skip,
        take: limit,
        orderBy: { name: "asc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.programInovasi.count({
        where: { isActive: true },
      }),
    ]);

    return {
      success: true,
      message: "Success fetch program inovasi with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch program inovasi with pagination",
    };
  }
}

export default programInovasiFindMany;

