/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function siswaFindMany(context: Context) {
  try {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (context.query.search as string) || "";
    const jenjangPendidikanName =
      (context.query.jenjangPendidikanName as string) || "";

    // Buat where clause
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

    // Add search functionality
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { lembaga: { nama: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.siswa.findMany({
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
      prisma.siswa.count({ where }),
    ]);

    console.log("Fetched siswa data count:", data.length);
    console.log("Total siswa count:", total);

    return {
      success: true,
      message: "Success fetch siswa with pagination",
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (error) {
    console.error("Error in siswaFindMany:", error);
    return {
      success: false,
      message: `Failed fetch siswa: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export default siswaFindMany;
