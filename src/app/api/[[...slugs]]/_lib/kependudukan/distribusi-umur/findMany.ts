/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function distribusiUmurFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 100;
  const tahun = context.query.tahun ? Number(context.query.tahun) : undefined;
  const search = context.query.search?.toString().trim();
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Filter by tahun hanya jika dikirim
  if (tahun) {
    where.tahun = tahun;
  }

  // Filter by search hanya jika dikirim — cocokkan ke rentangUmur (string)
  if (search) {
    where.rentangUmur = { contains: search, mode: "insensitive" };
  }

  try {
    const [data, total] = await Promise.all([
      prisma.distribusiUmur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.distribusiUmur.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch distribusi umur with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch distribusi umur with pagination",
      data: null,
    };
  }
}
