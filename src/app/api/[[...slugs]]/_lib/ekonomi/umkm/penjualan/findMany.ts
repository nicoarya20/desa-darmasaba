/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function penjualanProdukFindMany(context: Context) {
  const page = Number(context.query.page) || 1;
  const limit = Number(context.query.limit) || 10;
  const produkId = context.query.produkId as string | undefined;
  const periode = context.query.periode as string | undefined; // YYYY-MM
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };

  if (produkId) {
    where.produkId = produkId;
  }

  if (periode) {
    where.periode = periode;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.penjualanProduk.findMany({
        where,
        include: {
          produk: {
            include: {
              umkm: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { tanggal: 'desc' },
      }),
      prisma.penjualanProduk.count({ where }),
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data penjualan produk",
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di penjualanProdukFindMany:", e);
    return {
      success: false,
      message: "Gagal mengambil data penjualan produk",
    };
  }
}

export default penjualanProdukFindMany;
