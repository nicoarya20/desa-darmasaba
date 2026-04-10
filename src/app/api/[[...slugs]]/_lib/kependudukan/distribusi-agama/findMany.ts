/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function distribusiAgamaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 100;
  const search = (context.query.search as string) || '';
  const tahun = context.query.tahun ? Number(context.query.tahun) : undefined;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Filter by tahun hanya jika dikirim
  if (tahun) {
    where.tahun = tahun;
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { agama: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.distribusiAgama.findMany({
        where,
        skip,
        take: limit,
        orderBy: { jumlah: "desc" },
      }),
      prisma.distribusiAgama.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch distribusi agama with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch distribusi agama with pagination",
      data: null,
    };
  }
}
