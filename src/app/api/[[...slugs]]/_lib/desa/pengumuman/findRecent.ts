import prisma from "@/lib/prisma";
import { PENGUMUMAN_LIST_INCLUDE, PENGUMUMAN_LIST_ORDER_BY } from "@/lib/pengumuman-lampiran";

export default async function pengumumanFindRecent() {
  const result = await prisma.pengumuman.findMany({
    orderBy: PENGUMUMAN_LIST_ORDER_BY,
    take: 4, // ambil 4 data terbaru
    include: PENGUMUMAN_LIST_INCLUDE,
  });

  return {
    success: true,
    data: result,
  };
}
