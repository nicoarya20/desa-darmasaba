import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function penjualanProdukUpdate(context: Context) {
  const body = context.body as any;
  const id = context.params.id;
  const tanggal = body.tanggal ? new Date(body.tanggal) : new Date();
  const periode = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}`;
  const totalNilai = body.jumlah * body.hargaSatuan;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data lama untuk hitung selisih stok
      const oldData = await tx.penjualanProduk.findUnique({
        where: { id },
        select: { jumlah: true, produkId: true }
      });

      if (!oldData) throw new Error("Data penjualan tidak ditemukan");

      // 2. Update penjualan
      const updated = await tx.penjualanProduk.update({
        where: { id },
        data: {
          produkId: body.produkId,
          jumlah: body.jumlah,
          hargaSatuan: body.hargaSatuan,
          totalNilai: totalNilai,
          tanggal: tanggal,
          periode: periode,
          isActive: body.isActive,
        },
      });

      // 3. Update stok jika produk sama, sesuaikan selisih
      if (oldData.produkId === body.produkId) {
        const diff = body.jumlah - oldData.jumlah;
        await tx.produkUmkm.update({
          where: { id: body.produkId },
          data: {
            stok: {
              decrement: diff
            }
          }
        });
      } else {
        // Jika produk berubah, kembalikan stok lama dan kurangi stok baru
        await tx.produkUmkm.update({
          where: { id: oldData.produkId },
          data: {
            stok: {
              increment: oldData.jumlah
            }
          }
        });
        await tx.produkUmkm.update({
          where: { id: body.produkId },
          data: {
            stok: {
              decrement: body.jumlah
            }
          }
        });
      }

      return updated;
    });

    return {
      success: true,
      message: "Berhasil memperbarui data penjualan",
      data: result,
    };
  } catch (e) {
    console.error("Error di penjualanProdukUpdate:", e);
    return {
      success: false,
      message: "Gagal memperbarui data penjualan",
    };
  }
}

export default penjualanProdukUpdate;
