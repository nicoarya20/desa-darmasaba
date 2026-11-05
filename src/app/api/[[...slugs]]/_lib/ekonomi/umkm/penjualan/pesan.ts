import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { buatPesanan, type PesanInput } from "./_pesan";

const PESAN_GAGAL_UMUM = "Gagal membuat pesanan. Silakan coba lagi.";

/** POST publik (warga anonim) dari halaman produk UMKM; endpoint create admin tidak diubah. */
async function penjualanProdukPesan(context: Context) {
  const input = context.body as PesanInput;

  try {
    const result = await prisma.$transaction((tx) => buatPesanan(tx, input));

    if (!result.ok) {
      context.set.status = result.status;
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: "Pesanan berhasil dicatat",
      data: result.penjualan,
    };
  } catch (e) {
    console.error("Error di penjualanProdukPesan:", e);
    context.set.status = 500;
    return { success: false, message: PESAN_GAGAL_UMUM };
  }
}

export default penjualanProdukPesan;
