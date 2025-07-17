import prisma from "@/lib/prisma";

export default async function findRecentBerita() {
  const result = await prisma.berita.findMany({
    orderBy: {
      createdAt: "desc",
    },
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
