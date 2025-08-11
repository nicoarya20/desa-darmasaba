import prisma from "@/lib/prisma";

async function kategoriPengumumanFindMany() {
  const data = await prisma.categoryPengumuman.findMany({
    include: {
      _count: {
        select: {
          pengumumans: true
        }
      }
    }
  });
  return { data };
}

export default kategoriPengumumanFindMany
