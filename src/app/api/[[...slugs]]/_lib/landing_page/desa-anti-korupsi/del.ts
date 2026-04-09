import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function desaAntiKorupsiDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.desaAntiKorupsi.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus desa anti korupsi",
    data: deleted,
  };
}
