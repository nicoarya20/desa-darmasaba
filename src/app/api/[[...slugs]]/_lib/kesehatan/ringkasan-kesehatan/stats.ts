import prisma from "@/lib/prisma";

type StatsResult = {
  ibuHamilAktif: number;
  balitaTerdaftar: number;
  alertStunting: number;
  imunisasiLengkapPct: number;
  pemeriksaanRutinPct: number;
  giziBaikPct: number;
  targetStuntingPct: number;
};

export default async function ringkasanKesehatanStats(
  banjarId?: string
): Promise<{ success: boolean; data?: StatsResult; message?: string }> {
  try {
    const posyanduFilter = banjarId ? { posyandu: { banjarId } } : {};

    const [
      ibuHamilAktif,
      balitaTotal,
      alertStunting,
      imunisasiLengkap,
      pemeriksaanRutin,
      giziBaik,
      config,
    ] = await Promise.all([
      prisma.ibuHamil.count({ where: { status: "AKTIF", isActive: true, ...posyanduFilter } }),
      prisma.balita.count({ where: { isActive: true, ...posyanduFilter } }),
      prisma.balita.count({ where: { isActive: true, statusStunting: { in: ["ALERT", "STUNTING"] }, ...posyanduFilter } }),
      prisma.balita.count({ where: { isActive: true, imunisasiLengkap: true, ...posyanduFilter } }),
      prisma.balita.count({ where: { isActive: true, pemeriksaanRutin: true, ...posyanduFilter } }),
      prisma.balita.count({ where: { isActive: true, giziBaik: true, ...posyanduFilter } }),
      prisma.ringkasanKesehatanDesa.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    ]);

    const pct = (n: number, total: number) =>
      total === 0 ? 0 : Math.round((n / total) * 100);

    return {
      success: true,
      data: {
        ibuHamilAktif,
        balitaTerdaftar: balitaTotal,
        alertStunting,
        imunisasiLengkapPct: pct(imunisasiLengkap, balitaTotal),
        pemeriksaanRutinPct: pct(pemeriksaanRutin, balitaTotal),
        giziBaikPct: pct(giziBaik, balitaTotal),
        targetStuntingPct: config?.targetStuntingPct ?? 0,
      },
    };
  } catch (e) {
    console.error("ringkasanKesehatanStats error:", e);
    return { success: false, message: "Gagal menghitung statistik kesehatan" };
  }
}
