import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function desaAntiKorupsiFindUnique(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const data = await prisma.desaAntiKorupsi.findUnique({
    where: { id },
    include: {
      kategori: true,
      file: true,
    },
  });

  if (!data) {
    throw new Error("Desa anti korupsi tidak ditemukan");
  }

  return {
    success: true,
    message: "Data desa anti korupsi ditemukan",
    data,
  };
}
