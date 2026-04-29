/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kegiatanDesaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const kategori = (context.query.kategori as string) || '';
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { lokasi: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (kategori) {
    where.kategoriKegiatan = {
      nama: { contains: kategori, mode: 'insensitive' },
    };
  }

  try {
    const [data, total] = await Promise.all([
      prisma.kegiatanDesa.findMany({
        where,
        include: {
          kategoriKegiatan: true,
          image: true,
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'asc' },
      }),
      prisma.kegiatanDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil kegiatan desa",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di kegiatanDesaFindMany:", e);
    return { success: false, message: "Gagal mengambil data kegiatan desa" };
  }
}

export default kegiatanDesaFindMany;
