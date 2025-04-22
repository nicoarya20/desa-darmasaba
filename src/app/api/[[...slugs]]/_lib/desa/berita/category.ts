import prisma from "@/lib/prisma";

 async function katagoryBeritaFindMany() {
  const data = await prisma.katagoryBerita.findMany();
  return { data };
}

export default katagoryBeritaFindMany

