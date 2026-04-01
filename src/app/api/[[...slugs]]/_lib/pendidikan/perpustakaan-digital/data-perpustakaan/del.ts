import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function dataPerpustakaanDelete(context: Context) {
  const id = context.params.id as string;

  await prisma.dataPerpustakaan.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Sukses Menghapus data perpustakaan",
  };
}
