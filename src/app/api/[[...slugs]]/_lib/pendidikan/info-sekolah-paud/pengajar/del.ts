import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function pengajarDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.pengajar.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus pengajar",
    data: deleted,
  };
}
