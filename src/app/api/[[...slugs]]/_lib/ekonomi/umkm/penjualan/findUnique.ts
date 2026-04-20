import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function penjualanProdukFindUnique(context: Context) {
  const id = context.params.id;

  try {
    const data = await prisma.penjualanProduk.findUnique({
      where: { id },
      include: {
        produk: {
          include: {
            umkm: true
          }
        }
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Data penjualan tidak ditemukan",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil detail penjualan produk",
      data,
    };
  } catch (e) {
    console.error("Error di penjualanProdukFindUnique:", e);
    return {
      success: false,
      message: "Gagal mengambil detail penjualan produk",
    };
  }
}

export default penjualanProdukFindUnique;
