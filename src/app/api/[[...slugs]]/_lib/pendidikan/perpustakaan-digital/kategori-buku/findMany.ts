import prisma from "@/lib/prisma";

export default async function kategoriBukuFindMany() {
  const data = await prisma.kategoriBuku.findMany();

  return {
    success: true,
    message: "Success get all kategori buku",
    data,
  };
}
