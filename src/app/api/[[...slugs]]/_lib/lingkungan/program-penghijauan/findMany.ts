/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Di findMany.ts
export default async function programPenghijauanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = (context.query.search as string) || '';

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { judul: { contains: search, mode: 'insensitive' } },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.programPenghijauan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.programPenghijauan.count({
        where,
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Success fetch program penghijauan with pagination",
      data,
      page,
      totalPages,
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch program penghijauan with pagination",
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
    };
  }
}