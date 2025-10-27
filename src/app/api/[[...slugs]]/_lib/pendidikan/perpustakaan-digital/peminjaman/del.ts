import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function peminjamanBukuDelete(context: Context) {
  const id = context.params.id as string;

  await prisma.peminjamanBuku.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Success delete peminjaman buku",
  };
}
