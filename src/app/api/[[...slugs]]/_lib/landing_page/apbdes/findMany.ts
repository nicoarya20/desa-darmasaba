/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/.../apbdes/findMany.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function apbdesFindMany(context: Context) {
  const { page = "1", limit = "10", tahun } = context.query as {
    page?: string;
    limit?: string;
    tahun?: string;
  };

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const skip = (pageNumber - 1) * limitNumber;

  try {
    const where: any = { isActive: true };
    if (tahun) {
      where.tahun = parseInt(tahun, 10);
    }

    const [data, total] = await Promise.all([
      prisma.aPBDes.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          image: true,
          file: true,
          items: true,
        },
      }),
      prisma.aPBDes.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  } catch (error) {
    console.error("Error fetching APBDes list:", error);
    context.set.status = 500;
    return {
      success: false,
      message: "Gagal mengambil daftar APBDes",
    };
  }
}