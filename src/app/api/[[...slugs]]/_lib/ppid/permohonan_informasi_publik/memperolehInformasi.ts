import prisma from "@/lib/prisma";

export default async function memperolehInformasiFindMany() {
  const res = await prisma.caraMemperolehInformasi.findMany();
  return {
    data: res,
  };
}