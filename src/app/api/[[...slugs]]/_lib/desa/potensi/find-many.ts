/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function potensiDesaFindMany(context: Context) {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (context.query.search as string) || '';

    const where: any = { isActive: true };

    // Tambahkan pencarian (jika ada)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { kategori: { nama: { contains: search, mode: 'insensitive' } } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ];
    }
  
    try {
      const [data, total] = await Promise.all([
        prisma.potensiDesa.findMany({
          where,
          skip,
          take: limit,
          include: {
            image: true,
            kategori: true
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.potensiDesa.count({
          where: { isActive: true }
        })
      ]);

      return {
        success: true,
        message: "Success fetch potensi desa with pagination",
        data,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      };
    } catch (e) {
      console.error("Find many paginated error:", e);
      return {
        success: false,
        message: "Failed fetch potensi desa with pagination",
        data: [],
        page: 1,
        totalPages: 1,
        total: 0,
      };
    }
}