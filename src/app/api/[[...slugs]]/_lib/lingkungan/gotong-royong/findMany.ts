/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function kegiatanDesaFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const kategori = (context.query.kategori as string) || ''; // 🔥 Parameter kategori baru
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Filter berdasarkan kategori (jika ada)
  if (kategori) {
    where.kategoriKegiatan = {
      nama: {
        equals: kategori,
        mode: 'insensitive' // Tidak case-sensitive
      }
    };
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { deskripsiSingkat: { contains: search, mode: 'insensitive' } },
      { deskripsiLengkap: { contains: search, mode: 'insensitive' } },
      { kategoriKegiatan: { nama: { contains: search, mode: 'insensitive' } } }
    ];
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
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.kegiatanDesa.count({
        where,
      })
    ]);

    return {
      success: true,
      message: "Success fetch kegiatan desa with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch kegiatan desa with pagination",
    };
  }
}

export default kegiatanDesaFindMany;
