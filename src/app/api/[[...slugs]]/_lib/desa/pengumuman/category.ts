import prisma from "@/lib/prisma";

async function pengumumanCategoryFindMany() {
  const data = await prisma.categoryPengumuman.findMany();
  return { data };
}

export default pengumumanCategoryFindMany
