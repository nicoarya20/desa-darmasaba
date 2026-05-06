import prisma from "@/lib/prisma";

const cctvStats = async () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  try {
    const [cctvOnline, laporanMingguIni] = await Promise.all([
      prisma.cctvKeamanan.count({
        where: { isActive: true, status: "Online" },
      }),
      prisma.laporanPublik.count({
        where: {
          isActive: true,
          tanggalWaktu: { gte: startOfWeek },
        },
      }),
    ]);

    return {
      success: true,
      data: { cctvOnline, laporanMingguIni },
    };
  } catch (e) {
    console.error("Gagal ambil stats keamanan:", e);
    return { success: false, message: "Gagal mengambil statistik keamanan" };
  }
};

export default cctvStats;
