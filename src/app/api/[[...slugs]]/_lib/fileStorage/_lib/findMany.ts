import prisma from "@/lib/prisma";

export const fileStorageFindMany = async () => {
  const data = await prisma.fileStorage.findMany();
  return data;
};
