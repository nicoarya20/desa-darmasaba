import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardKpi(context: Context) {
  const periode = (context.query.periode as string) || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  try {
    const [umkmAktif, totalUmkm, omzetBulanan] = await Promise.all([
      prisma.umkm.count({ where: { isActive: true, deletedAt: null } }),
      prisma.umkm.count({ where: { deletedAt: null } }),
      prisma.penjualanProduk.aggregate({
        where: { periode, deletedAt: null },
        _sum: { totalNilai: true }
      }),
    ]);

    // Hitung Kategori Terpopuler berdasarkan jumlah penjualan
    const salesByCategory = await prisma.penjualanProduk.findMany({
      where: { periode, deletedAt: null },
      select: {
        jumlah: true,
        produk: {
          select: {
            kategoriProdukId: true
          }
        }
      }
    });

    let kategoriNama = "-";

    if (salesByCategory.length > 0) {
      const categoryCounts: Record<string, number> = {};
      salesByCategory.forEach(sale => {
        const catId = sale.produk.kategoriProdukId;
        if (catId) {
          categoryCounts[catId] = (categoryCounts[catId] || 0) + sale.jumlah;
        }
      });

      // Cari ID kategori dengan penjualan tertinggi
      let topCategoryId = null;
      let maxSales = 0;
      for (const [id, count] of Object.entries(categoryCounts)) {
        if (count > maxSales) {
          maxSales = count;
          topCategoryId = id;
        }
      }

      if (topCategoryId) {
        const kat = await prisma.kategoriProduk.findUnique({
          where: { id: topCategoryId },
          select: { nama: true }
        });
        kategoriNama = kat?.nama || "-";
      }
    } else {
      // Fallback: Jika tidak ada penjualan, ambil kategori dengan UMKM terbanyak
      const kategoriTerbanyakUmkm = await prisma.umkm.groupBy({
        by: ['kategoriId'],
        _count: { _all: true },
        orderBy: { _count: { kategoriId: 'desc' } },
        take: 1
      });

      if (kategoriTerbanyakUmkm.length > 0) {
        const kat = await prisma.kategoriProduk.findUnique({
          where: { id: kategoriTerbanyakUmkm[0].kategoriId },
          select: { nama: true }
        });
        kategoriNama = kat?.nama || "-";
      }
    }

    return {
      success: true,
      data: {
        umkmAktif,
        totalUmkm,
        omzetBulanan: omzetBulanan._sum.totalNilai || 0,
        kategoriTerbanyak: kategoriNama
      }
    };
  } catch (e) {
    console.error("Error di umkmDashboardKpi:", e);
    return { success: false, message: "Gagal mengambil data KPI dashboard" };
  }
}

export default umkmDashboardKpi;
