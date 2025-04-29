import prisma from "@/lib/prisma";

export default async function DokumenDiperlukanFindMany() {
  const res = await prisma.dokumenJadwalKegiatan.findMany();
  return {
    data: res,
  };
}
