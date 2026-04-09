import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function kegiatanDesaFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.kegiatanDesa.findUnique({
    where: { id },
    include: {
      kategoriKegiatan: true,
      image: true,
    },
  });

  if (!data) {
    throw new Error("Kegiatan desa tidak ditemukan");
  }

  return {
    success: true,
    message: "Data kegiatan desa ditemukan",
    data,
  };
}
