/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/desa/musik/find-many.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function musikFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const genre = (context.query.genre as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Filter berdasarkan genre (jika ada)
  if (genre) {
    where.genre = {
      equals: genre,
      mode: 'insensitive'
    };
  }

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { artis: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } },
      { genre: { contains: search, mode: 'insensitive' } }
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.musikDesa.findMany({
        where,
        include: {
          audioFile: true,
          coverImage: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.musikDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data musik dengan pagination",
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
      message: "Gagal mengambil data musik",
    };
  }
}

export default musikFindMany;
