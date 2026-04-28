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

async function umkmDashboardRingSummary(context: Context) {
  const mode = context.query.mode as string | undefined;
  const isWeek = mode === "week";

  const periode =
    (context.query.periode as string) ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  // Hitung periode bulan lalu
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
    const [penjualanSkrg, penjualanLalu, kategoriAktif, totalTransaksi] = await Promise.all([
      prisma.penjualanProduk.aggregate({
        where: whereSkrg,
        _sum: { totalNilai: true },
      }),
      prisma.penjualanProduk.aggregate({
        where: whereLalu,
        _sum: { totalNilai: true },
      }),
      // Hitung jumlah kategori aktif
      prisma.kategoriProdukUmkm.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.penjualanProduk.count({ where: whereSkrg }),
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
        kategoriAktif,
        totalTransaksi,
      },
    };
  } catch (e) {
    console.error("Error di umkmDashboardRingSummary:", e);
    return { success: false, message: "Gagal mengambil ringkasan dashboard" };
  }
}

export default umkmDashboardRingSummary;
