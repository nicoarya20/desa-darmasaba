import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function administrasiOnlineDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.administrasiOnline.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus administrasi online",
    data: deleted,
  };
}
