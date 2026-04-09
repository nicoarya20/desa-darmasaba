import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function lembagaPendidikanFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.lembaga.findUnique({
    where: { id },
    include: {
      jenjangPendidikan: true,
      siswa: true,
      pengajar: true,
    },
  });

  if (!data) {
    throw new Error("Lembaga pendidikan tidak ditemukan");
  }

  return {
    success: true,
    message: "Data lembaga pendidikan ditemukan",
    data,
  };
}
