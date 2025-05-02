import prisma from "@/lib/prisma";

export default async function introductionFindMany() {
  const res = await prisma.introduction.findMany();
  return {
    data: res,
  };
}