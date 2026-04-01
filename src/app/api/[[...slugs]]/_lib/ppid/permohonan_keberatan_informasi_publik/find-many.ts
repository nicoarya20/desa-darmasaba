/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function permohonanKeberatanInformasiPublikFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      {email: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.formulirPermohonanKeberatan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.formulirPermohonanKeberatan.count({
        where: { isActive: true },
      }),
    ]);

    return {
      success: true,
      message: "Success fetch formulir permohonan keberatan with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch formulir permohonan keberatan with pagination",
    };
  }
}
