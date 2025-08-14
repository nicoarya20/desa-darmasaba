/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function persentaseKelahiranKematianFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { kematian: { nama: { contains: search, mode: 'insensitive' } } },
      { kelahiran: { nama: { contains: search, mode: 'insensitive' } } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.dataKematian_Kelahiran.findMany({
        where,
        include: {
          kematian: true,
          kelahiran: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.dataKematian_Kelahiran.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil data persentase kelahiran kematian dengan pagination",
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
      message: "Gagal mengambil data persentase kelahiran kematian",
    };
  }
}

export default persentaseKelahiranKematianFindMany;