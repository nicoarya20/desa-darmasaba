/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function artikelKesehatanFindMany(context: Context) {
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
      { title: { contains: search, mode: "insensitive" } },
      { introduction: { content: { contains: search, mode: "insensitive" } } },
      { symptom: { title: { contains: search, mode: "insensitive" } } },
      { prevention: { title: { contains: search, mode: "insensitive" } } },
      { firstaid: { title: { contains: search, mode: "insensitive" } } },
      { mythvsfact: { title: { contains: search, mode: "insensitive" } } },
      { doctorsign: { content: { contains: search, mode: "insensitive" } } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
      prisma.artikelKesehatan.findMany({
        where,
        include: {
          introduction: true,
          symptom: true,
          prevention: true,
          firstaid: true,
          mythvsfact: true,
          doctorsign: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.artikelKesehatan.count({ where }),
    ]);
    return {
      success: true,
      message: "Berhasil ambil keamanan lingkungan dengan pagination",
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
      message: "Gagal mengambil data keamanan lingkungan",
    };
  }
}

