/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Di findMany.ts
export default async function programKreatifFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.programKreatif.findMany({
        where: where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.programKreatif.count({
        where: where
      })
    ]);

    return {
      success: true,
      message: "Success fetch program kreatif with pagination",
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch program kreatif with pagination",
    };
  }
}