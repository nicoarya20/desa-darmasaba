import prisma from "@/lib/prisma";
import { BERITA_LIST_ORDER_BY } from "@/lib/berita-data";

export default async function findManyUI() {
  const data = await prisma.berita.findMany({
    include: {
      image: true,
      kategoriBerita: true,
    },
    orderBy: BERITA_LIST_ORDER_BY,
  });
  return {
    success: true,
    data,
  };
}
