import prisma from "@/lib/prisma";

export default async function grafikHasilKepuasanMasyarakatFindMany() {
  const res = await prisma.indeksKepuasanMasyarakat.findMany();
  return {
    data: res,
  };
}
