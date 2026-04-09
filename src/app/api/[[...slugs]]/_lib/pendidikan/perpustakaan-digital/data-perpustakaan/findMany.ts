/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function dataPerpustakaanFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const kategori = (context.query.kategori as string) || ''; // 🔥 Parameter kategori baru
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Filter berdasarkan kategori (jika ada)
  if (kategori) {
    where.kategori = {
      name: {
        equals: kategori,
        mode: 'insensitive' // Tidak case-sensitive
      }
    };
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.dataPerpustakaan.findMany({
        where,
        include: {
          image: true,
          kategori: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dataPerpustakaan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data perpustakaan dengan pagination",
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
      message: "Gagal mengambil data perpustakaan",
    };
  }
}

export default dataPerpustakaanFindMany;