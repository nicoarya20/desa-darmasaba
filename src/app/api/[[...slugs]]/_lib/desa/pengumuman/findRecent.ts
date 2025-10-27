import prisma from "@/lib/prisma";

export default async function pengumumanFindRecent() {
  const result = await prisma.pengumuman.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 4, // ambil 4 data terbaru
    include: {
      CategoryPengumuman: true,
    },
  });

  return {
    success: true,
    data: result,
  };
}
