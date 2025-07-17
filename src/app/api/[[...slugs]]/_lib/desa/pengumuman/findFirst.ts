import prisma from '@/lib/prisma';

export default async function pengumumanFindFirst() {
  try {
    const result = await prisma.pengumuman.findFirst({
      where: {
        isActive: true, // opsional kalau kamu punya field ini
      },
      orderBy: {
        createdAt: 'desc', // ambil yang paling terbaru
      },
      include: {
        CategoryPengumuman: true,
      }
    });

    return {
      success: true,
      message: 'Berhasil ambil pengumuman terbaru',
      data: result,
    };
  } catch (error) {
    console.error('[findFirstPengumuman] Error:', error);
    return {
      success: false,
      message: 'Gagal ambil pengumuman terbaru',
    };
  }
}
