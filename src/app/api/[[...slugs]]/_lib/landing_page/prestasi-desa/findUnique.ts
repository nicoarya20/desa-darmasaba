import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function prestasiDesaFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.prestasiDesa.findUnique({
    where: { id },
    include: {
      image: true,
      kategori: true,
    },
  });

  if (!data) {
    throw new Error("Prestasi Desa tidak ditemukan");
  }

  return {
    success: true,
    message: "Data Prestasi Desa ditemukan",
    data,
  };
}
