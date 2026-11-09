/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { DESA_ANTI_KORUPSI_RINGKAS_INCLUDE, toProgramRingkas } from "@/lib/desa-anti-korupsi-view";
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
    const [rows, total] = await Promise.all([
      prisma.desaAntiKorupsi.findMany({
        where,
        // kategori + _count folder/dokumen aktif (subquery dalam satu query, bukan N+1)
        include: DESA_ANTI_KORUPSI_RINGKAS_INCLUDE,
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
      data: rows.map(toProgramRingkas), // ringkasan jumlahFolder/jumlahDokumen, tanpa isi dokumen
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
