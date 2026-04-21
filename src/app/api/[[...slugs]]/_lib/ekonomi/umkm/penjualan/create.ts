import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function penjualanProdukCreate(context: Context) {
  const body = context.body as any;
  const tanggal = body.tanggal ? new Date(body.tanggal) : new Date();
  
  // Format periode YYYY-MM
  const periode = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`;
  
  const totalNilai = body.jumlah * body.hargaSatuan;

  try {
    // Gunakan transaction untuk update stok produk (PasarDesa)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Catat penjualan (relasi ke PasarDesa)
      const penjualan = await tx.penjualanProduk.create({
        data: {
          produkId: body.produkId,
          jumlah: body.jumlah,
          hargaSatuan: body.hargaSatuan,
          totalNilai: totalNilai,
          tanggal: tanggal,
          periode: periode,
          isActive: body.isActive ?? true,
        },
      });

      // 2. Update stok di model PasarDesa
      await tx.pasarDesa.update({
        where: { id: body.produkId },
        data: {
          stok: {
            decrement: body.jumlah
          }
        }
      });

      return penjualan;
    });

    return {
      success: true,
      message: "Berhasil mencatat penjualan produk (PasarDesa)",
      data: result,
    };
  } catch (e) {
    console.error("Error di penjualanProdukCreate:", e);
    return {
      success: false,
      message: "Gagal mencatat penjualan produk",
    };
  }
}

export default penjualanProdukCreate;
