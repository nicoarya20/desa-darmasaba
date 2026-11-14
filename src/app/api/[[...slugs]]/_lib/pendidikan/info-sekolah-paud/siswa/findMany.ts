/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";
import { jenjangSegmentFilters, paginateSegments } from "../jenjang-sort";

async function siswaFindMany(context: Context) {
  try {
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (context.query.search as string) || "";
    const jenjangPendidikanName =
      (context.query.jenjangPendidikanName as string) || "";
    // Filter satu jenjang sudah membuat semua baris sejenjang; urutan jenjang hanya berarti tanpa filter.
    const sortByJenjang = context.query.sort === SORT_BY_JENJANG && !jenjangPendidikanName;

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

    const findPage = (pageWhere: Prisma.SiswaWhereInput, pageSkip: number, take: number) =>
      prisma.siswa.findMany({
        where: pageWhere,
        include: {
          lembaga: {
            include: {
              jenjangPendidikan: true,
            },
          },
        },
        skip: pageSkip,
        take,
        orderBy: [{ nama: "asc" }, { lembaga: { nama: "asc" } }],
      });

    const { data, total } = sortByJenjang
      ? await paginateSegments(
          (await jenjangSegmentFilters()).map((segment) => {
            const segmentWhere = { AND: [where, { lembaga: segment }] };
            return {
              count: () => prisma.siswa.count({ where: segmentWhere }),
              fetch: (segmentSkip: number, take: number) => findPage(segmentWhere, segmentSkip, take),
            };
          }),
          skip,
          limit,
        )
      : await Promise.all([findPage(where, skip, limit), prisma.siswa.count({ where })]).then(
          ([rows, count]) => ({ data: rows, total: count }),
        );

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
