import prisma from "@/lib/prisma";

export default async function ringkasanDataPengangguranFindMany() {
  const res = await prisma.ringkasanDataPengangguran.findMany({
    orderBy: [{ year: "desc" }],
  });
  return {
    data: res,
  };
}
