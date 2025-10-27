import prisma from "@/lib/prisma";

export default async function findManyUI() {
  const data = await prisma.berita.findMany({
    include: {
      image: true,
      kategoriBerita: true,
    },
  });
  return {
    success: true,
    data,
  };
}
