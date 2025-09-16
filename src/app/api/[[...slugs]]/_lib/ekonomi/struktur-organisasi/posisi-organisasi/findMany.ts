/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function posisiOrganisasiFindMany(context: Context) {
  // Ambil parameter dari query
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.posisiOrganisasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),
      prisma.posisiOrganisasi.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil semua data posisi organisasi",
      data: data.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        deskripsi: item.deskripsi,
        hierarki: item.hierarki,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di findMany paginated:", e);
    return {
      success: false,
      message: "Gagal mengambil data posisi organisasi",
    };
  }
}
