import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function mediaSosialDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.mediaSosial.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus media sosial",
    data: deleted,
  };
}
