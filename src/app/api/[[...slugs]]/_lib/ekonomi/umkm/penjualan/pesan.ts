import prisma from "@/lib/prisma";
import { PESANAN_WEBSITE_NONAKTIF, UMKM_PESANAN_TERCATAT } from "@/lib/umkm-pesanan";
import { Context } from "elysia";
import { buatPesanan, type PesanInput } from "./_pesan";

const PESAN_GAGAL_UMUM = "Gagal membuat pesanan. Silakan coba lagi.";
// 403, bukan 410: penolakan ini kebijakan SEMENTARA (saklar UMKM_PESANAN_TERCATAT),
// sedangkan 410 Gone menyiratkan endpoint hilang permanen.
const HTTP_FORBIDDEN = 403;

/**
 * Buat handler POST publik (warga anonim) dari halaman produk UMKM; endpoint create admin
 * tidak diubah. `pesananTercatat` di-inject agar mode aktif & nonaktif sama-sama bisa dites.
 */
export function createPenjualanProdukPesan(pesananTercatat: boolean = UMKM_PESANAN_TERCATAT) {
  return async function penjualanProdukPesan(context: Context) {
    // Ditolak sebelum menyentuh DB: tidak ada pesanan tercatat dan stok tidak berkurang.
    if (!pesananTercatat) {
      context.set.status = HTTP_FORBIDDEN;
      return { success: false, message: PESANAN_WEBSITE_NONAKTIF };
    }

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
  };
}

export default createPenjualanProdukPesan();
