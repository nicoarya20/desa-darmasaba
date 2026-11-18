// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { PENGADUAN_STATUS, PENGADUAN_STATUS_DEFAULT, parsePengaduanStatus, type PengaduanStatus } from "@/lib/pengaduan-status";

/** Filter kolom status; BARU juga mencakup baris lama yang statusnya null (dibaca BARU, tanpa backfill). */
function statusWhere(status: PengaduanStatus): Prisma.PengaduanMasyarakatWhereInput {
  return status === PENGADUAN_STATUS_DEFAULT ? { OR: [{ status: null }, { status }] } : { status };
}

async function pengaduanMasyarakatFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || '';
  const skip = (page - 1) * limit;

  const statusParam = context.query.status as string | undefined;
  const status = statusParam ? parsePengaduanStatus(statusParam) : null;
  if (statusParam && !status) {
    context.set.status = 400;
    return { success: false, message: `Status tidak valid, gunakan salah satu dari: ${PENGADUAN_STATUS.join(", ")}` };
  }

  // Buat where clause
  const where: Prisma.PengaduanMasyarakatWhereInput = { isActive: true };
  if (status) where.AND = [statusWhere(status)];

  // Tambahkan pencarian (jika ada)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { judulPengaduan: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.pengaduanMasyarakat.findMany({
        where: where,
        include: {
          jenisPengaduan: true,
          image: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // opsional, kalau mau urut berdasarkan waktu
      }),
      prisma.pengaduanMasyarakat.count({
        where: where
      })
    ]);

    return {
      success: true,
      message: "Success fetch pengaduan masyarakat with pagination",
      data,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Failed fetch pengaduan masyarakat with pagination",
    };
  }
}

export default pengaduanMasyarakatFindMany;
