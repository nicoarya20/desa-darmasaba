import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

export default async function dataPerpustakaanDelete(context: Context) {
  const id = context.params.id as string;

  const deleted = await prisma.dataPerpustakaan.delete({
    where: { id },
  });
  await removeReleasedFiles("DataPerpustakaan", [deleted.imageId]);

  return {
    status: 200,
    success: true,
    message: "Sukses Menghapus data perpustakaan",
  };
}
