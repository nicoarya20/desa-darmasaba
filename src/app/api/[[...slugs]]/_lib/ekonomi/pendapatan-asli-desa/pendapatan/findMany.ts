
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function pendapatanAsliFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.pendapatan.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pendapatan.count({
        where: { isActive: true }
      })
    ]);

    return {
      success: true,
      message: "Success fetch berita with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch berita with pagination",
    };
  }
}

export default pendapatanAsliFindMany;
