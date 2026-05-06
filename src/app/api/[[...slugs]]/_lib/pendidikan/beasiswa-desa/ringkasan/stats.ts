import prisma from "@/lib/prisma";

type StatsResult = {
  jumlahPenerima: number;
  danaTersalurkan: string;
  tahunAjaran: string;
};

export default async function beasiswaRingkasanStats(): Promise<{
  success: boolean;
  data?: StatsResult;
  message?: string;
}> {
  try {
    const [jumlahPenerima, config] = await Promise.all([
      prisma.beasiswaPendaftar.count({ where: { isActive: true } }),
      prisma.beasiswaConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      success: true,
      data: {
        jumlahPenerima,
        danaTersalurkan: (config?.danaTersalurkan ?? BigInt(0)).toString(),
        tahunAjaran: config?.tahunAjaran ?? "-",
      },
    };
  } catch (e) {
    console.error("beasiswaRingkasanStats error:", e);
    return { success: false, message: "Gagal menghitung statistik beasiswa" };
  }
}
