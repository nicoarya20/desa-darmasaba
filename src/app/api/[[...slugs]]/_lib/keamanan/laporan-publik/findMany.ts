/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function laporanPublikFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: "insensitive" } },
      { lokasi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.laporanPublik.findMany({
        where,
        include: {
          penanganan: true,
        },
        skip,
        take: limit,
        orderBy: {
          tanggalWaktu: "desc",
        },
      }),
      prisma.laporanPublik.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil laporan publik dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data laporan publik",
    };
  }
}

export default laporanPublikFindMany;
