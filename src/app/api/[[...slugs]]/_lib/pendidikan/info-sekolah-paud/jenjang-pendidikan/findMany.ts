/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jenjangPendidikanFindMany(context: Context) {
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
      { lembagas: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.jenjangPendidikan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.jenjangPendidikan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil jenjang pendidikan dengan pagination",
      data: data.map((item: any) => {
        return {
          id: item.id,
          nama: item.nama,
          lembagas: item.lembagas,
        };
      }),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data jenjang pendidikan",
    };
  }
}
