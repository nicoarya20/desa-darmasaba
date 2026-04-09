/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function dataBanjarFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 100;
  const search = (context.query.search as string) || '';
  const tahun = Number(context.query.tahun) || new Date().getFullYear();
  const skip = (page - 1) * limit;

  const where: any = { isActive: true, tahun };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.dataBanjar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: "asc" },
      }),
      prisma.dataBanjar.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch data banjar with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch data banjar with pagination",
      data: null,
    };
  }
}
