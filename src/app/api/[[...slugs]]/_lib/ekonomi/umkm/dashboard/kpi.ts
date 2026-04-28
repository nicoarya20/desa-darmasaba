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

async function umkmDashboardKpi(context: Context) {
  const mode = context.query.mode as string | undefined;
  const isWeek = mode === "week";

  const periode =
    (context.query.periode as string) ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const whereClause = isWeek
    ? { createdAt: { gte: getWeekRange(0).start, lte: getWeekRange(0).end }, deletedAt: null }
    : { periode, deletedAt: null };

  try {
    const [umkmAktif, totalUmkm, omzetBulanan] = await Promise.all([
      prisma.umkm.count({ where: { isActive: true, deletedAt: null } }),
      prisma.umkm.count({ where: { deletedAt: null } }),
      prisma.penjualanProduk.aggregate({
        where: whereClause,
        _sum: { totalNilai: true },
      }),
    ]);

    // Cari kategori dengan penjualan terbanyak
    const salesByCategory = await prisma.penjualanProduk.findMany({
      where: whereClause,
      select: {
        jumlah: true,
        produk: { select: { kategoriProdukId: true } },
      },
    });

    let kategoriNama = "-";
    let topCategoryId: string | null = null;

    if (salesByCategory.length > 0) {
      const categoryCounts: Record<string, number> = {};

      for (const sale of salesByCategory) {
        const catId = sale.produk.kategoriProdukId;
        if (!catId) continue;
        categoryCounts[catId] = (categoryCounts[catId] || 0) + sale.jumlah;
      }

      let maxSales = 0;
      for (const [id, count] of Object.entries(categoryCounts)) {
        if (count > maxSales) {
          maxSales = count;
          topCategoryId = id;
        }
      }

      if (topCategoryId) {
        const kategori = await prisma.kategoriProdukUmkm.findUnique({
          where: { id: topCategoryId },
          select: { nama: true },
        });
        kategoriNama = kategori?.nama || "-";
      }
    }

    // Fallback: kategori dari UMKM terbanyak
    if (kategoriNama === "-") {
      const kategoriTerbanyakUmkm = await prisma.umkm.groupBy({
        by: ["kategoriId"],
        _count: { _all: true },
        orderBy: { _count: { kategoriId: "desc" } },
        take: 1,
      });

      if (kategoriTerbanyakUmkm.length > 0) {
        topCategoryId = kategoriTerbanyakUmkm[0].kategoriId;
        const kategori = await prisma.kategoriProdukUmkm.findUnique({
          where: { id: topCategoryId },
          select: { nama: true },
        });
        kategoriNama = kategori?.nama || "-";
      }
    }

    // Hitung jumlah produk dalam kategori terbanyak
    const jumlahKategoriTerbanyak = topCategoryId
      ? await prisma.pasarDesa.count({
          where: { kategoriProdukId: topCategoryId, deletedAt: null },
        })
      : 0;

    return {
      success: true,
      data: {
        umkmAktif,
        totalUmkm,
        omzetBulanan: omzetBulanan._sum.totalNilai || 0,
        kategoriTerbanyak: kategoriNama,
        jumlahKategoriTerbanyak,
      },
    };
  } catch (e) {
    console.error("Error di umkmDashboardKpi:", e);
    return { success: false, message: "Gagal mengambil data KPI dashboard" };
  }
}

export default umkmDashboardKpi;
