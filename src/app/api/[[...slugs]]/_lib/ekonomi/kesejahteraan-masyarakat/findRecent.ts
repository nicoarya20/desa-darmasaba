import prisma from "@/lib/prisma";

export default async function findRecentKesejahteraan() {
  const result = await prisma.kesejahteraanMasyarakat.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      image: true,
    },
  });

  return {
    success: true,
    data: result,
  };
}
