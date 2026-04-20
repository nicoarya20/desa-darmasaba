import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardTopProduk(context: Context) {
  const periode = (context.query.periode as string) || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  try {
    const topPenjualan = await prisma.penjualanProduk.groupBy({
      by: ['produkId'],
      where: { periode, deletedAt: null },
      _sum: { totalNilai: true, jumlah: true },
      orderBy: { _sum: { totalNilai: 'desc' } },
      take: 3
    });

    const data = await Promise.all(topPenjualan.map(async (item) => {
      const produk = await prisma.produkUmkm.findUnique({
        where: { id: item.produkId },
        include: { umkm: true }
      });

      return {
        namaProduk: produk?.nama || "Unknown",
        namaUmkm: produk?.umkm.nama || "Unknown",
        totalPenjualan: item._sum.totalNilai || 0,
        jumlahTerjual: item._sum.jumlah || 0,
        growth: 0 // logic growth bisa ditambah jika diperlukan
      };
    }));

    return {
      success: true,
      data
    };
  } catch (e) {
    console.error("Error di umkmDashboardTopProduk:", e);
    return { success: false, message: "Gagal mengambil top produk" };
  }
}

export default umkmDashboardTopProduk;
