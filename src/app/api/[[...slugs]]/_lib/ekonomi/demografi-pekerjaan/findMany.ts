/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function demografiPekerjaanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { pekerjaan: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.dataDemografiPekerjaan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dataDemografiPekerjaan.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch demografi pekerjaan with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch demografi pekerjaan with pagination",
      data: null,
    };
  }
}
