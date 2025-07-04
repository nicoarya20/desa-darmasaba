import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pasarDesaFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.pasarDesa.findUnique({
    where: { id },
    include: {
      image: true,
      KategoriToPasar: {
        include: {
          kategori: true,
        },
      },
    },
  });

  if (!data) {
    throw new Error("Pasar desa tidak ditemukan");
  }

  return {
    success: true,
    message: "Data pasar desa ditemukan",
    data,
  };
}
