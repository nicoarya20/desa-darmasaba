/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikMenganggurBerdasarkanUsiaFindMany(
  context: Context
) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { usia18_25: { contains: search, mode: "insensitive" } },
      { usia26_35: { contains: search, mode: "insensitive" } },
      { usia36_45: { contains: search, mode: "insensitive" } },
      { usia46_keatas: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.grafikMenganggurBerdasarkanUsia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.grafikMenganggurBerdasarkanUsia.count({
        where,
      }),
    ]);

    return {
      success: true,
      message:
        "Success fetch grafik menganggur berdasarkan usia with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message:
        "Failed to fetch grafik menganggur berdasarkan usia with pagination",
      data: null,
    };
  }
}
