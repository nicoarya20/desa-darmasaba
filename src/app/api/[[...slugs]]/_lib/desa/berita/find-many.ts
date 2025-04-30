import prisma from "@/lib/prisma";

export default async function beritaFindMany() {
  const res = await prisma.berita.findMany();
  return {
    data: res,
  };
}
