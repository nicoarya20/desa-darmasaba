// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function sdgsDesaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.sDGSDesa.findMany({
        where: { isActive: true },
        include: {
          image: true,
        },
        skip,
        take: limit,
        orderBy: { jumlah: "desc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.sDGSDesa.count({
        where: { isActive: true },
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
