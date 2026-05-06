/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function cctvFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { kode: { contains: search, mode: "insensitive" } },
      { nama: { contains: search, mode: "insensitive" } },
      { lokasi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.cctvKeamanan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kode: "asc" },
      }),
      prisma.cctvKeamanan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data CCTV",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di cctvFindMany:", e);
    return { success: false, message: "Gagal mengambil data CCTV" };
  }
}

export default cctvFindMany;
