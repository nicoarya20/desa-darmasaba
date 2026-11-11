import prisma from "@/lib/prisma";
import { BERITA_LIST_ORDER_BY } from "@/lib/berita-data";

export default async function findRecentBerita() {
  const result = await prisma.berita.findMany({
    orderBy: BERITA_LIST_ORDER_BY,
    take: 4, // ambil 4 data terbaru
    include: {
      image: true,
      kategoriBerita: true,
    },
  });

  return {
    success: true,
    data: result,
  };
}
