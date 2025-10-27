/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function desaAntiKorupsiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  // Buat where clause
  const where: any = { isActive: true };

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
      { kategori: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  try {
    const [data, total] = await Promise.all([
      prisma.desaAntiKorupsi.findMany({
        where,
        include: {
          kategori: true,
          file: true,
        },
        skip: limit === 0 ? undefined : skip,
        take: limit === 0 ? undefined : limit,
        orderBy: { name: "asc" }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.desaAntiKorupsi.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: "Success fetch desa anti korupsi with pagination",
      data,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch desa anti korupsi with pagination",
    };
  }
}

export default desaAntiKorupsiFindMany;
