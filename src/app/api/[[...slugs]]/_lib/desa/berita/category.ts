import prisma from "@/lib/prisma";

 async function kategoriBeritaFindMany() {
  const data = await prisma.kategoriBerita.findMany();
  return { data };
}

export default kategoriBeritaFindMany

