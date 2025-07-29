import prisma from "@/lib/prisma";

export default async function beasiswaPendaftarFindMany() {
  const data = await prisma.beasiswaPendaftar.findMany();

  return {
    success: true,
    message: "Success get all beasiswa pendaftar",
    data,
  };
}
