import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function administrasiOnlineFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.administrasiOnline.findUnique({
    where: { id },
    include: {
      jenisLayanan: true,
    },
  });

  if (!data) {
    throw new Error("Administrasi online tidak ditemukan");
  }

  return {
    success: true,
    message: "Data administrasi online ditemukan",
    data,
  };
}
