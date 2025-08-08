import prisma from "@/lib/prisma";

async function kategoriPengumumanFindMany() {
  const data = await prisma.categoryPengumuman.findMany();
  return { data };
}

export default kategoriPengumumanFindMany
