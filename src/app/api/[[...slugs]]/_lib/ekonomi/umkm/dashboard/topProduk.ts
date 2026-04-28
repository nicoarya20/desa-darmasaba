import prisma from "@/lib/prisma";
import { Context } from "elysia";

function getWeekRange(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

async function umkmDashboardTopProduk(context: Context) {
  const mode = context.query.mode as string | undefined;
  const isWeek = mode === "week";

  const periode =
    (context.query.periode as string) ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const date = new Date(periode + "-01");
  date.setMonth(date.getMonth() - 1);
  const periodeLalu = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const whereSkrg = isWeek
    ? { createdAt: { gte: getWeekRange(0).start, lte: getWeekRange(0).end }, deletedAt: null }
    : { periode, deletedAt: null };

  const whereLalu = isWeek
    ? { createdAt: { gte: getWeekRange(-1).start, lte: getWeekRange(-1).end }, deletedAt: null }
    : { periode: periodeLalu, deletedAt: null };

  try {
    const topPenjualan = await prisma.penjualanProduk.groupBy({
      by: ["produkId"],
      where: whereSkrg,
      _sum: { totalNilai: true, jumlah: true },
      orderBy: { _sum: { totalNilai: "desc" } },
      take: 3,
    });

    // Ambil penjualan periode lalu untuk produk yang sama
    const produkIds = topPenjualan.map((p) => p.produkId);
    const penjualanLalu = await prisma.penjualanProduk.groupBy({
      by: ["produkId"],
      where: { ...whereLalu, produkId: { in: produkIds } },
      _sum: { totalNilai: true },
    });

    const laluMap = new Map(
      penjualanLalu.map((p) => [p.produkId, p._sum.totalNilai || 0])
    );

    const data = await Promise.all(
      topPenjualan.map(async (item) => {
        const produk = await prisma.pasarDesa.findUnique({
          where: { id: item.produkId },
          include: { umkm: true },
        });

        const totalSkrg = item._sum.totalNilai || 0;
        const totalLalu = laluMap.get(item.produkId) || 0;

        let growth = 0;
        if (totalLalu > 0) {
          growth = Math.round(((totalSkrg - totalLalu) / totalLalu) * 10000) / 100;
        } else if (totalSkrg > 0) {
          growth = 100;
        }

        return {
          namaProduk: produk?.nama || "Unknown",
          namaUmkm: produk?.umkm?.nama || "Unknown",
          totalPenjualan: totalSkrg,
          jumlahTerjual: item._sum.jumlah || 0,
          growth,
        };
      })
    );

    return { success: true, data };
  } catch (e) {
    console.error("Error di umkmDashboardTopProduk:", e);
    return { success: false, message: "Gagal mengambil top produk" };
  }
}

export default umkmDashboardTopProduk;
