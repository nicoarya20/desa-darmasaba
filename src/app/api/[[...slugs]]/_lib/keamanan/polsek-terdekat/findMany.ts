/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function polsekTerdekatFindMany(context: Context) {
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
      { nama: { contains: search, mode: 'insensitive' } },
      { alamat: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.polsekTerdekat.findMany({
        where,
        include: {
          layananPolsek: true,
          LayananToPolsek: {
            include: {
              layanan: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.polsekTerdekat.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil polsek terdekat dengan pagination",
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
      message: "Gagal mengambil data polsek terdekat",
    };
  }
}

export default polsekTerdekatFindMany;