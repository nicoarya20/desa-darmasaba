import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function siswaFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.siswa.findUnique({
    where: { id },
    include: {
      lembaga: true,
    },
  });

  if (!data) {
    throw new Error("Siswa tidak ditemukan");
  }

  return {
    success: true,
    message: "Data siswa ditemukan",
    data,
  };
}
