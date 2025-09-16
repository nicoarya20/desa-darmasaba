/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function grafikPengangguranBerdasarkanPendidikanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { SD: { contains: search, mode: "insensitive" } },
      { SMP: { contains: search, mode: "insensitive" } },
      { SMA: { contains: search, mode: "insensitive" } },
      { D3: { contains: search, mode: "insensitive" } },
      { S1: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.grafikMenganggurBerdasarkanPendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.grafikMenganggurBerdasarkanPendidikan.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch grafik menganggur berdasarkan pendidikan with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch grafik menganggur berdasarkan pendidikan with pagination",
      data: null,
    };
  }
}
