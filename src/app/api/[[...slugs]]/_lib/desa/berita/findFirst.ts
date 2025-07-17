import prisma from '@/lib/prisma';

export default async function beritaFindFirst() {
  try {
    const result = await prisma.berita.findFirst({
      where: {
        isActive: true, // opsional kalau kamu punya field ini
      },
      orderBy: {
        createdAt: 'desc', // ambil yang paling terbaru
      },
      include: {
        image: true,
        kategoriBerita: true,
      }
    });

    return {
      success: true,
      message: 'Berhasil ambil berita terbaru',
      data: result,
    };
  } catch (error) {
    console.error('[findFirstBerita] Error:', error);
    return {
      success: false,
      message: 'Gagal ambil berita terbaru',
    };
  }
}
