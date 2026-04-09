/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function pengumumanFindMany(context: Context) {
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
    where.CategoryPengumuman = {
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
      { deskripsi: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { CategoryPengumuman: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.pengumuman.findMany({
        where,
        include: {
          CategoryPengumuman: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pengumuman.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil pengumuman dengan pagination",
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
      message: "Gagal mengambil data pengumuman",
    };
  }
}

export default pengumumanFindMany;