/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function lembagaPendidikanFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { siswa: { contains: search, mode: "insensitive" } },
      { pengajar: { contains: search, mode: "insensitive" } },
      { jenjangPendidikan: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.lembaga.findMany({
        where,
        include: {
          jenjangPendidikan: true,
          siswa: true,
          pengajar: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
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
      message: "Failed fetch lembaga pendidikan with pagination",
    };
  }
}

export default lembagaPendidikanFindMany;
