import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { buildProdukWhere } from "./_where";

async function produkUmkmFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const where = buildProdukWhere({
    search: (context.query.search as string) || undefined,
    umkmId: context.query.umkmId as string | undefined,
    kategoriId: context.query.kategoriId as string | undefined,
    unggulan: context.query.unggulan as string | undefined,
  });
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.pasarDesa.findMany({
        where,
        include: {
          image: true,
          umkm: {
            include: { kategori: true }
          },
          kategoriProduk: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pasarDesa.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data produk UMKM",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di produkUmkmFindMany:", e);
    return {
      success: false,
      message: "Gagal mengambil data produk UMKM",
    };
  }
}

export default produkUmkmFindMany;
