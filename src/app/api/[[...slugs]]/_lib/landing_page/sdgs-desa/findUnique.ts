import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function sdgsDesaFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.sDGSDesa.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!data) {
    throw new Error("SDGS Desa tidak ditemukan");
  }

  return {
    success: true,
    message: "Data SDGS Desa ditemukan",
    data,
  };
}
