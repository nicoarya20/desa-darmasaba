import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardKpi(context: Context) {
  const periode =
    (context.query.periode as string) ||
    `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`;

  try {
    // KPI utama
    const [umkmAktif, totalUmkm, omzetBulanan] = await Promise.all([
      prisma.umkm.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.umkm.count({
        where: { deletedAt: null },
      }),
      prisma.penjualanProduk.aggregate({
        where: { periode, deletedAt: null },
        _sum: { totalNilai: true },
      }),
    ]);

    // =========================
    // 1. Cari kategori dari penjualan
    // =========================
    const salesByCategory = await prisma.penjualanProduk.findMany({
      where: { periode, deletedAt: null },
      select: {
        jumlah: true,
        produk: {
          select: {
            kategoriProdukId: true,
          },
        },
      },
    });

    let kategoriNama = "-";

    if (salesByCategory.length > 0) {
      const categoryCounts: Record<string, number> = {};

      for (const sale of salesByCategory) {
        const catId = sale.produk.kategoriProdukId;
        if (!catId) continue;

        categoryCounts[catId] =
          (categoryCounts[catId] || 0) + sale.jumlah;
      }

      // cari kategori dengan penjualan tertinggi
      let topCategoryId: string | null = null;
      let maxSales = 0;

      for (const [id, count] of Object.entries(categoryCounts)) {
        if (count > maxSales) {
          maxSales = count;
          topCategoryId = id;
        }
      }

      if (topCategoryId) {
        const kategori = await prisma.kategoriProduk.findUnique({
          where: { id: topCategoryId },
          select: { nama: true },
        });

        kategoriNama = kategori?.nama || "-";
      }
    }

    // =========================
    // 2. Fallback (kalau tidak ada penjualan)
    // =========================
    if (kategoriNama === "-") {
      const kategoriTerbanyakUmkm = await prisma.umkm.groupBy({
        by: ["kategoriId"],
        _count: { _all: true },
        orderBy: {
          _count: { kategoriId: "desc" },
        },
        take: 1,
      });

      if (kategoriTerbanyakUmkm.length > 0) {
        const kategori = await prisma.kategoriProduk.findUnique({
          where: { id: kategoriTerbanyakUmkm[0].kategoriId },
          select: { nama: true },
        });

        kategoriNama = kategori?.nama || "-";
      }
    }

    return {
      success: true,
      data: {
        umkmAktif,
        totalUmkm,
        omzetBulanan: omzetBulanan._sum.totalNilai || 0,
        kategoriTerbanyak: kategoriNama,
      },
    };
  } catch (e) {
    console.error("Error di umkmDashboardKpi:", e);
    return {
      success: false,
      message: "Gagal mengambil data KPI dashboard",
    };
  }
}

export default umkmDashboardKpi;