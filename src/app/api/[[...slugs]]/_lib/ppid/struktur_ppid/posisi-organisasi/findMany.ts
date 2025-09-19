/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/posisi-organisasi/findManyPaginated.ts
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function posisiOrganisasiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";

  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { deskripsi: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const whereClause = {
      ...where,
      isActive: true,
    };

    const [data, total] = await Promise.all([
      prisma.posisiOrganisasiPPID.findMany({
        where: whereClause,
        ...(limit === 0
          ? {} // kalau limit = 0 → ambil semua data (tanpa skip & take)
          : {
              skip: (page - 1) * limit,
              take: limit,
            }),
        orderBy: { hierarki: "asc" },
      }),
      prisma.posisiOrganisasiPPID.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message:
        limit === 0
          ? "Berhasil mengambil semua data posisi organisasi"
          : "Berhasil mengambil data posisi organisasi dengan pagination",
      data: data.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        deskripsi: item.deskripsi,
        hierarki: item.hierarki,
      })),
      page: limit === 0 ? 1 : page,
      totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      total,
    };
  } catch (e) {
    console.error("Find many paginated error:", e);
    return {
      success: false,
      message: "Gagal mengambil data posisi organisasi",
    };
  }
}

export default posisiOrganisasiFindMany;
