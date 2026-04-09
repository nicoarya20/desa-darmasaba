/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function lembagaPendidikanFindMany(context: Context) {
  try {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const search = (context.query.search as string) || "";
    const skip = (page - 1) * limit;
    const jenjangPendidikanName = (context.query.jenjangPendidikanId as string) || "";
    // Buat where clause
    const where: any = { isActive: true };

    // Filter berdasarkan jenjang pendidikan (jika ada)
    if (jenjangPendidikanName) {
      // Cari jenjang pendidikan berdasarkan nama
      const jenjangPendidikan = await prisma.jenjangPendidikan.findFirst({
        where: {
          nama: {
            equals: jenjangPendidikanName,
            mode: 'insensitive',
          },
          isActive: true,
        },
        orderBy: { nama: 'desc' },
      });

      if (jenjangPendidikan) {
        where.jenjangId = jenjangPendidikan.id;
      } else {
        // Jika tidak ditemukan, return data kosong
        return {
          success: true,
          message: "Jenjang pendidikan tidak ditemukan",
          data: [],
          page,
          limit,
          totalPages: 0,
          total: 0,
        };
      }
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { jenjangPendidikan: { nama: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.lembaga.findMany({
        where,
        include: {
          jenjangPendidikan: true,
        },
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      prisma.lembaga.count({
        where,
      })
    ]);

    return {
      success: true,
      message: "Success fetch lembaga pendidikan with pagination",
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
      message: `Failed fetch lembaga pendidikan: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }
}

export default lembagaPendidikanFindMany;
