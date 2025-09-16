/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function detailDataPengangguranFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { year: { contains: search, mode: "insensitive" } },
      { month: { contains: search, mode: "insensitive" } },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.detailDataPengangguran.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { month: "asc" }],
      }),
      prisma.detailDataPengangguran.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch apb desa with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch apb desa with pagination",
      data: null,
    };
  }
}
