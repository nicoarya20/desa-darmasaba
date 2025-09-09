/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pelayananSuratKeteranganFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = (context.query.search as string) || '';

  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }


  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.pelayananSuratKeterangan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          image: true,
          image2: true,
        },
      }),
      prisma.pelayananSuratKeterangan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil pelayanan surat keterangan dengan pagination",
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
      message: "Gagal mengambil data pelayanan surat keterangan",
    };
  }
}