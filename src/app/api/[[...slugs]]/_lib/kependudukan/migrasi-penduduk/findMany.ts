/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function migrasiPendudukFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const jenis = (context.query.jenis as string) || '';
  const tahun = context.query.tahun ? Number(context.query.tahun) : undefined;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (jenis) {
    where.jenis = jenis;
  }

  // Filter by tahun hanya jika dikirim
  if (tahun) {
    where.tanggal = {
      gte: new Date(`${tahun}-01-01`),
      lte: new Date(`${tahun}-12-31`),
    };
  }

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { asal: { contains: search, mode: "insensitive" } },
      { tujuan: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.migrasiPenduduk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: "desc" },
      }),
      prisma.migrasiPenduduk.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch migrasi penduduk with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to fetch migrasi penduduk with pagination",
      data: null,
    };
  }
}
