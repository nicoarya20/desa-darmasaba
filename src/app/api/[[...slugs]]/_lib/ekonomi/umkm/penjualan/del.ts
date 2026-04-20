import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function penjualanProdukDelete(context: Context) {
  const id = context.params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data penjualan
      const data = await tx.penjualanProduk.findUnique({
        where: { id },
        select: { jumlah: true, produkId: true }
      });

      if (!data) throw new Error("Data penjualan tidak ditemukan");

      // 2. Soft delete
      const deleted = await tx.penjualanProduk.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // 3. Kembalikan stok produk
      await tx.produkUmkm.update({
        where: { id: data.produkId },
        data: {
          stok: {
            increment: data.jumlah
          }
        }
      });

      return deleted;
    });

    return {
      success: true,
      message: "Berhasil menghapus data penjualan dan mengembalikan stok",
      data: result,
    };
  } catch (e) {
    console.error("Error di penjualanProdukDelete:", e);
    return {
      success: false,
      message: "Gagal menghapus data penjualan",
    };
  }
}

export default penjualanProdukDelete;
