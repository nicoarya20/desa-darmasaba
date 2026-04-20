/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const kategoriId = context.query.kategoriId as string | undefined;
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };

  if (kategoriId) {
    where.kategoriId = kategoriId;
  }

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: 'insensitive' } },
      { pemilik: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        include: {
          image: true,
          kategori: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.umkm.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data UMKM",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di umkmFindMany:", e);
    return {
      success: false,
      message: "Gagal mengambil data UMKM",
    };
  }
}

export default umkmFindMany;
