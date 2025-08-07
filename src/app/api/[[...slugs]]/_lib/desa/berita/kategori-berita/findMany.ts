import prisma from "@/lib/prisma";

export default async function kategoriBeritaFindMany() {
  const data = await prisma.kategoriBerita.findMany();

  return {
    success: true,
    message: "Success get all kategori berita",
    data,
  };
}
