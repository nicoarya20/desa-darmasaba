/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikJumlahPendudukMiskinFindMany(
  context: Context
) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    const yearSearch = Number(search);

    where.OR = [
      // kalau search bisa diparse jadi number → cocokin year
      ...(isNaN(yearSearch) ? [] : [{ year: yearSearch }]),
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.grafikJumlahPendudukMiskin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.grafikJumlahPendudukMiskin.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch grafik jumlah penduduk miskin with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch grafik jumlah penduduk miskin with pagination",
      data: null,
    };
  }
}
