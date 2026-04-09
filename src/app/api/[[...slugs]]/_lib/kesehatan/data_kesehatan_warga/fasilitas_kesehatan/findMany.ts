/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/berita/findManyPaginated.ts
import prisma from "@/lib/prisma";
import type { Context } from "elysia";

async function fasilitasKesehatanFindMany(context: Context) {
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
      { informasiUmum: { fasilitas: { contains: search, mode: 'insensitive' } } },
      { layananUnggulan: { content: { contains: search, mode: 'insensitive' } } },
      { dokterdanTenagaMedis: { name: { contains: search, mode: 'insensitive' } } },
      { fasilitasPendukung: { content: { contains: search, mode: 'insensitive' } } },
      { prosedurPendaftaran: { content: { contains: search, mode: 'insensitive' } } },
      { tarifdanlayanan: { layanan: { contains: search, mode: 'insensitive' } } },
    ];
  }

  try {
    // Ambil data dan total count secara paralel
    const [data, total] = await Promise.all([
        prisma.fasilitasKesehatan.findMany({
            where,
            include: {
                informasiumum: true,
                layananunggulan: true,
                dokterdantenagamedis: true,
                fasilitaspendukung: true,
                prosedurpendaftaran: true,
                tarifdanlayanan: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.fasilitasKesehatan.count({ where }),
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
export default fasilitasKesehatanFindMany