import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pengajarFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.pengajar.findUnique({
    where: { id },
    include: {
      lembaga: true,
    },
  });

  if (!data) {
    throw new Error("Pengajar tidak ditemukan");
  }

  return {
    success: true,
    message: "Data pengajar ditemukan",
    data,
  };
}
