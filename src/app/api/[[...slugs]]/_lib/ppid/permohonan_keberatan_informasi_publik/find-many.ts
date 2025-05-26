import prisma from "@/lib/prisma";

export default async function permohonanKeberatanInformasiPublikFindMany() {
  const res = await prisma.formulirPermohonanKeberatan.findMany();
  return {
    data: res,
  };
}
