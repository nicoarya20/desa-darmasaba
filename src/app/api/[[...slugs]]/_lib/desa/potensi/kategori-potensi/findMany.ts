import prisma from "@/lib/prisma";

export default async function kategoriPotensiFindMany() {
  const data = await prisma.kategoriPotensi.findMany();

  return {
    success: true,
    message: "Success get all kategori potensi",
    data,
  };
}
