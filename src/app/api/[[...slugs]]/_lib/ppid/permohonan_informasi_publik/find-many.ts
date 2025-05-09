import prisma from "@/lib/prisma";

export default async function permohonanInformasiPublikFindMany() {
  const res = await prisma.permohonanInformasiPublik.findMany();
  return {
    data: res,
  };
}
