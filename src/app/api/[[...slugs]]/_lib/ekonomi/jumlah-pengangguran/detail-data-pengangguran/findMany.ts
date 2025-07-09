import prisma from "@/lib/prisma";

export default async function detailDataPengangguranFindMany() {
  const res = await prisma.detailDataPengangguran.findMany({
    orderBy: [{ year: "desc" }, { month: "asc" }],
  });
  return {
    data: res,
  };
}
