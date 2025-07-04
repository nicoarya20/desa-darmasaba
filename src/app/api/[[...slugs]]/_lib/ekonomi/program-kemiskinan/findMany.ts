import prisma from "@/lib/prisma";

export default async function programKemiskinanFindMany() {
  const data = await prisma.programKemiskinan.findMany({
    include: {
      statistik: true, // ikut sertakan relasinya
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    message: "Success get all program layanan",
    data,
  };
}
