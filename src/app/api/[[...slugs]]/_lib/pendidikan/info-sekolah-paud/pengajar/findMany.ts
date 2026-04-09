/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function pengajarFindMany(context: Context) {
  try {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (context.query.search as string) || "";
    const jenjangPendidikanName =
      (context.query.jenjangPendidikanId as string) || "";

    const where: any = { isActive: true };

    // Filter berdasarkan jenjang pendidikan (jika ada)
    if (jenjangPendidikanName) {
      // Cari jenjang pendidikan berdasarkan nama
      const jenjangPendidikan = await prisma.jenjangPendidikan.findFirst({
        where: {
          nama: {
            equals: jenjangPendidikanName,
            mode: "insensitive",
          },
          isActive: true,
        },
        orderBy: { nama: "desc" },
      });

      if (jenjangPendidikan) {
        where.lembaga = {
          ...where.lembaga,
          jenjangId: jenjangPendidikan.id,
        };
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

    // Add search condition if search term exists
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { lembaga: { nama: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.pengajar.findMany({
        where,
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ nama: "asc" }, { lembaga: { nama: "asc" } }],
      }),
      prisma.pengajar.count({ where }),
    ]);

    return {
      success: true,
      message: "Success fetch pengajar with pagination",
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (error) {
    console.error("Error in pengajarFindMany:", error);
    return {
      success: false,
      message: `Failed fetch pengajar: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
export default pengajarFindMany;
