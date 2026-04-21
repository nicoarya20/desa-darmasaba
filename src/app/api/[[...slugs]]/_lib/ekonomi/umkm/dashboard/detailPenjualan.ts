import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function umkmDashboardDetailPenjualan(context: Context) {
  const periode = (context.query.periode as string) || 
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const date = new Date(periode + "-01");
  date.setMonth(date.getMonth() - 1);
  const periodeLalu = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Ambil semua produk yang punya penjualan bulan ini atau bulan lalu
    const [produkSkrg, produkLalu, allProduks] = await Promise.all([
      prisma.penjualanProduk.groupBy({
        by: ['produkId'],
        where: { periode, deletedAt: null },
        _sum: { totalNilai: true, jumlah: true }
      }),
      prisma.penjualanProduk.groupBy({
        by: ['produkId'],
        where: { periode: periodeLalu, deletedAt: null },
        _sum: { totalNilai: true }
      }),
      // Use PasarDesa with umkmId filter
      prisma.pasarDesa.findMany({
        where: { deletedAt: null, umkmId: { not: null } },
        select: { id: true, nama: true, stok: true }
      })
    ]);

    const data = allProduks.map(p => {
      const skrgRaw = produkSkrg.find(s => s.produkId === p.id)?._sum || { totalNilai: 0, jumlah: 0 };
      const laluRaw = produkLalu.find(l => l.produkId === p.id)?._sum || { totalNilai: 0 };
      
      const skrg = {
        totalNilai: (skrgRaw as any).totalNilai || 0,
        jumlah: (skrgRaw as any).jumlah || 0
      };
      const lalu = {
        totalNilai: (laluRaw as any).totalNilai || 0
      };
      
      let trend = "stable";
      if (skrg.totalNilai > lalu.totalNilai) trend = "up";
      if (skrg.totalNilai < lalu.totalNilai) trend = "down";

      let statusStok = "Aman";
      if (p.stok < 5) statusStok = "Rendah";
      else if (p.stok < 20) statusStok = "Menipis";

      return {
        namaProduk: p.nama,
        penjualanBulanIni: skrg.totalNilai,
        penjualanBulanLalu: lalu.totalNilai,
        trend,
        volume: skrg.jumlah,
        stok: p.stok,
        statusStok
      };
    });

    return {
      success: true,
      data
    };
  } catch (e) {
    console.error("Error di umkmDashboardDetailPenjualan:", e);
    return { success: false, message: "Gagal mengambil detail penjualan dashboard" };
  }
}

export default umkmDashboardDetailPenjualan;
