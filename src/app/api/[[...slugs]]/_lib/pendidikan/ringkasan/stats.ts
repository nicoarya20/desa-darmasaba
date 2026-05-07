import prisma from "@/lib/prisma";

type PerJenjang = { nama: string; jumlahSiswa: number, jumlahPengajar: number };

type StatsResult = {
  perJenjang: PerJenjang[];
  jumlahLembaga: number;
  jumlahPengajar: number;
};

export default async function pendidikanRingkasanStats(): Promise<{
  success: boolean;
  data?: StatsResult;
  message?: string;
}> {
  try {
    const [jenjangList, jumlahLembaga, jumlahPengajar] = await Promise.all([
      prisma.jenjangPendidikan.findMany({
        where: { isActive: true },
        include: {
          lembagas: {
            where: { isActive: true },
            include: {
              _count: { select: { siswa: { where: { isActive: true } }, pengajar: { where: { isActive: true } } } },
            },
          },
        },
      }),
      prisma.lembaga.count({ where: { isActive: true } }),
      prisma.pengajar.count({ where: { isActive: true } }),
    ]);

    const perJenjang = jenjangList.map((j) => ({
      nama: j.nama,
      jumlahSiswa: j.lembagas.reduce((acc, l) => acc + l._count.siswa, 0),
      jumlahPengajar: j.lembagas.reduce((acc, l) => acc + l._count.pengajar, 0),
    }));

    return {
      success: true,
      data: { perJenjang, jumlahLembaga, jumlahPengajar },
    };
  } catch (e) {
    console.error("pendidikanRingkasanStats error:", e);
    return { success: false, message: "Gagal menghitung statistik pendidikan" };
  }
}
