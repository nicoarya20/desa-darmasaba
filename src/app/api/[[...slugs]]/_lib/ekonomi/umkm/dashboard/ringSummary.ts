import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardRingSummary(context: Context) {
  const periode = (context.query.periode as string) || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // Hitung periode bulan lalu
  const date = new Date(periode + "-01");
  date.setMonth(date.getMonth() - 1);
  const periodeLalu = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  try {
    const [penjualanSkrg, penjualanLalu, produkAktif, totalTransaksi] = await Promise.all([
      prisma.penjualanProduk.aggregate({
        where: { periode, deletedAt: null },
        _sum: { totalNilai: true }
      }),
      prisma.penjualanProduk.aggregate({
        where: { periode: periodeLalu, deletedAt: null },
        _sum: { totalNilai: true }
      }),
      // Count from PasarDesa with umkmId filter
      prisma.pasarDesa.count({ 
        where: { isActive: true, deletedAt: null, umkmId: { not: null } } 
      }),
      prisma.penjualanProduk.count({ where: { periode, deletedAt: null } })
    ]);

    const skrg = penjualanSkrg._sum.totalNilai || 0;
    const lalu = penjualanLalu._sum.totalNilai || 0;
    
    let persentasePerubahan = 0;
    if (lalu > 0) {
      persentasePerubahan = ((skrg - lalu) / lalu) * 100;
    } else if (skrg > 0) {
      persentasePerubahan = 100;
    }

    return {
      success: true,
      data: {
        totalPenjualan: skrg,
        persentasePerubahan: Math.round(persentasePerubahan * 100) / 100,
        produkAktif,
        totalTransaksi
      }
    };
  } catch (e) {
    console.error("Error di umkmDashboardRingSummary:", e);
    return { success: false, message: "Gagal mengambil ringkasan dashboard" };
  }
}

export default umkmDashboardRingSummary;
