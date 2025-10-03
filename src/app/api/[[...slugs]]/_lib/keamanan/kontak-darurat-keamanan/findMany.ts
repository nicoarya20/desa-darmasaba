/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function kontakDaruratKeamananFindMany(context: Context) {
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
      { kontakItems: { some: { kontakItem: { nama: { contains: search, mode: "insensitive" } } } } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.kontakDaruratKeamanan.findMany({
        where,
        include: {
          kontakItems: {
            include: {
              kontakItem: true,
              
            },
          },
          kategori: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.kontakDaruratKeamanan.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil kontak darurat keamanan dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Find many error:", e);
    return {
      success: false,
      message: "Failed fetch kontak darurat keamanan",
    };
  }
}
