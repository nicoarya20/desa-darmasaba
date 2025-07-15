// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function administrasiOnlineFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.administrasiOnline.findMany({
        where: { isActive: true },
        include: {
          jenisLayanan: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.administrasiOnline.count({
        where: { isActive: true }
      })
    ]);

    return {
      success: true,
      message: "Success fetch administrasi online with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch administrasi online with pagination",
    };
  }
}

export default administrasiOnlineFindMany;
