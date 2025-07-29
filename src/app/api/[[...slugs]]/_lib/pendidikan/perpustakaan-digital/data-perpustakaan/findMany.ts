import prisma from "@/lib/prisma";

export default async function dataPerpustakaanFindMany() {
  const data = await prisma.dataPerpustakaan.findMany({
    include: {
      kategori: true,
      image: true,
    },
  });

  return {
    success: true,
    message: "Success get all data perpustakaan",
    data,
  };
}
