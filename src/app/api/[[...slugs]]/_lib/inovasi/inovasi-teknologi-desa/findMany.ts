import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { buildInovasiWhere, parseKategoriFilter } from "./inovasi-teknologi.query";

/** Daftar Inovasi Teknologi Desa aktif berpaginasi; query `page`, `limit`, `search`, `kategori` (digital|tepat-guna). */
export default async function inovasiTeknologiFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const search = (context.query.search as string) || "";
  const skip = (page - 1) * limit;

  const filter = parseKategoriFilter(context.query.kategori);
  if (!filter.ok) {
    context.set.status = 400;
    return { success: false, message: `Kategori "${filter.value}" tidak dikenal`, data: [] };
  }
  const where = buildInovasiWhere({ search, kategori: filter.kategori });

  try {
    const [data, total] = await Promise.all([
      prisma.inovasiTeknologiDesa.findMany({
        where,
        include: { image: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.inovasiTeknologiDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil inovasi teknologi desa dengan pagination",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error(`Gagal ambil inovasi teknologi desa (halaman ${page}, kategori "${filter.kategori ?? "semua"}"):`, e);
    context.set.status = 500;
    return {
      success: false,
      message: "Gagal mengambil data inovasi teknologi desa",
    };
  }
}
