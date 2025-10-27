import prisma from "@/lib/prisma";

export default async function permohonanInformasiPublikFindMany() {
  const res = await prisma.permohonanInformasiPublik.findMany({
    include: {
      jenisInformasiDiminta: true,
      caraMemperolehInformasi: true,
      caraMemperolehSalinanInformasi: true,
    }
  });
  return {
    data: res,
  };
}
