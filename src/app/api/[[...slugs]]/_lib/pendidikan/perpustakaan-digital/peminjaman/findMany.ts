/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function peminjamanBukuFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = {};

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { catatan: { contains: search, mode: 'insensitive' } },
      { nama: { contains: search, mode: 'insensitive' } },
      { buku: { judul: { contains: search, mode: 'insensitive' } } },
      { noTelp: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.peminjamanBuku.findMany({
        where,
        include: {
          buku: {
            select: {
              id: true,
              judul: true,
              kategoriId: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
              isActive: true,
              imageId: true,
              deskripsi: true
            }
          },
        },
        skip,
        take: limit,
        orderBy: { tanggalPinjam: 'desc' },
      }),
      prisma.peminjamanBuku.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data peminjaman buku dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di peminjamanBukuFindMany:", e);
    return {
      success: false,
      message: "Gagal mengambil data peminjaman buku",
    };
  }
}

export default peminjamanBukuFindMany;
