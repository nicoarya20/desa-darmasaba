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
      // 1. Validasi stok produk
      const produk = await tx.pasarDesa.findUnique({
        where: { id: body.produkId },
        select: { stok: true }
      });

      if (!produk) {
        throw new Error("Produk tidak ditemukan");
      }

      if (produk.stok < body.jumlah) {
        throw new Error(`Stok tidak mencukupi. Tersedia: ${produk.stok}`);
      }

      // 2. Catat penjualan (relasi ke PasarDesa)
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

      // 3. Update stok di model PasarDesa
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
