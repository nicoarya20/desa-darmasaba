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

async function umkmDashboardDetailPenjualan(context: Context) {
  const mode = context.query.mode as string | undefined;
  const isWeek = mode === "week";

  const periode =
    (context.query.periode as string) ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const date = new Date(periode + "-01");
  date.setMonth(date.getMonth() - 1);
  const periodeLalu = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const kategoriId = context.query.kategoriId as string | undefined;
  const umkmId = context.query.umkmId as string | undefined;

  const whereSkrg = isWeek
    ? { createdAt: { gte: getWeekRange(0).start, lte: getWeekRange(0).end }, deletedAt: null }
    : { periode, deletedAt: null };

  const whereLalu = isWeek
    ? { createdAt: { gte: getWeekRange(-1).start, lte: getWeekRange(-1).end }, deletedAt: null }
    : { periode: periodeLalu, deletedAt: null };

  // Filter produk berdasarkan kategori dan/atau UMKM
  const produkFilter: Record<string, unknown> = { deletedAt: null };
  if (kategoriId) produkFilter.kategoriProdukId = kategoriId;
  if (umkmId) produkFilter.umkmId = umkmId;

  try {
    const [produkSkrg, produkLalu, allProduks] = await Promise.all([
      prisma.penjualanProduk.groupBy({
        by: ["produkId"],
        where: whereSkrg,
        _sum: { totalNilai: true, jumlah: true },
      }),
      prisma.penjualanProduk.groupBy({
        by: ["produkId"],
        where: whereLalu,
        _sum: { totalNilai: true },
      }),
      prisma.pasarDesa.findMany({
        where: produkFilter,
        select: { id: true, nama: true, stok: true },
      }),
    ]);

    const data = allProduks.map((p) => {
      const skrgRaw = produkSkrg.find((s) => s.produkId === p.id)?._sum || {};
      const laluRaw = produkLalu.find((l) => l.produkId === p.id)?._sum || {};

      const nilaiSkrg = (skrgRaw as any).totalNilai || 0;
      const nilaiLalu = (laluRaw as any).totalNilai || 0;
      const jumlah = (skrgRaw as any).jumlah || 0;

      let trend = "stable";
      if (nilaiSkrg > nilaiLalu) trend = "up";
      if (nilaiSkrg < nilaiLalu) trend = "down";

      let trendPersen = 0;
      if (nilaiLalu > 0) {
        trendPersen = Math.round(((nilaiSkrg - nilaiLalu) / nilaiLalu) * 10000) / 100;
      } else if (nilaiSkrg > 0) {
        trendPersen = 100;
      }

      let statusStok = "Aman";
      if (p.stok < 5) statusStok = "Rendah";
      else if (p.stok < 20) statusStok = "Menipis";

      return {
        namaProduk: p.nama,
        penjualanBulanIni: nilaiSkrg,
        penjualanBulanLalu: nilaiLalu,
        trend,
        trendPersen,
        volume: jumlah,
        stok: p.stok,
        statusStok,
      };
    });

    return { success: true, data };
  } catch (e) {
    console.error("Error di umkmDashboardDetailPenjualan:", e);
    return { success: false, message: "Gagal mengambil detail penjualan dashboard" };
  }
}

export default umkmDashboardDetailPenjualan;
