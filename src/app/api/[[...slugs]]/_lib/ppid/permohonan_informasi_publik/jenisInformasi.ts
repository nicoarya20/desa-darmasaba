import prisma from "@/lib/prisma";

export default async function jenisInformasiFindMany() {
  const res = await prisma.jenisInformasiDiminta.findMany();
  return {
    data: res,
  };
}
