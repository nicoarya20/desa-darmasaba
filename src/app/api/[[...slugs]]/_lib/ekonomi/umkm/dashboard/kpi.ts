import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardKpi(context: Context) {
  const periode = (context.query.periode as string) || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  try {
    const [umkmAktif, totalUmkm, omzetBulanan, kategoriTerbanyak] = await Promise.all([
      prisma.umkm.count({ where: { isActive: true, deletedAt: null } }),
      prisma.umkm.count({ where: { deletedAt: null } }),
      prisma.penjualanProduk.aggregate({
        where: { periode, deletedAt: null },
        _sum: { totalNilai: true }
      }),
      prisma.umkm.groupBy({
        by: ['kategoriId'],
        _count: { _all: true },
        orderBy: { _count: { kategoriId: 'desc' } },
        take: 1
      })
    ]);

    // Ambil nama kategori jika ada
    let kategoriNama = "-";
    if (kategoriTerbanyak.length > 0) {
      const kat = await prisma.kategoriProduk.findUnique({
        where: { id: kategoriTerbanyak[0].kategoriId },
        select: { nama: true }
      });
      kategoriNama = kat?.nama || "-";
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
