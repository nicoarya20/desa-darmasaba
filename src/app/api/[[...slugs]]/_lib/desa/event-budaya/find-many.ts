/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function eventBudayaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { lokasi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.eventBudaya.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: "asc" },
      }),
      prisma.eventBudaya.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil event budaya",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di eventBudayaFindMany:", e);
    return { success: false, message: "Gagal mengambil data event budaya" };
  }
}

export default eventBudayaFindMany;
