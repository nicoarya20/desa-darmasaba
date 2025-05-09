import prisma from "@/lib/prisma";

export default async function salinanInformasiFindMany() {
  const res = await prisma.caraMemperolehSalinanInformasi.findMany();
  return {
    data: res,
  };
}
  