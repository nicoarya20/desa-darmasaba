import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

export default async function mediaSosialDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.mediaSosial.delete({
    where: { id },
  });
  await removeReleasedFiles("MediaSosial", [deleted.imageId]);

  return {
    success: true,
    message: "Berhasil menghapus media sosial",
    data: deleted,
  };
}
