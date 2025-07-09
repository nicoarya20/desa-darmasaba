import prisma from "@/lib/prisma";

export default async function sedangMencariKerjaFindMany() {
  const res = await prisma.sedangMencariKerja.findMany({
    orderBy: [{ recordedDate: "desc" }],
  });
  return {
    data: res,
  };
}
