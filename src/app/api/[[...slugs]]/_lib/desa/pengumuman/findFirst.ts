import prisma from '@/lib/prisma';
import { PENGUMUMAN_LIST_INCLUDE, PENGUMUMAN_LIST_ORDER_BY } from '@/lib/pengumuman-lampiran';

export default async function pengumumanFindFirst() {
  try {
    const result = await prisma.pengumuman.findFirst({
      where: {
        isActive: true, // opsional kalau kamu punya field ini
      },
      orderBy: PENGUMUMAN_LIST_ORDER_BY, // ambil yang paling baru terbit
      include: PENGUMUMAN_LIST_INCLUDE,
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
