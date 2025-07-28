import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function lembagaPendidikanDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID lembaga pendidikan wajib diisi");
  }

  const deleted = await prisma.lembaga.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Berhasil menghapus lembaga pendidikan",
    data: deleted,
  };
}
