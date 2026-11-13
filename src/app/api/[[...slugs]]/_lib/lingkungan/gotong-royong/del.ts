import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

export default async function kegiatanDesaDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  const deleted = await prisma.kegiatanDesa.delete({
    where: { id },
  });
  await removeReleasedFiles("KegiatanDesa", [deleted.imageId]);

  return {
    success: true,
    message: "Berhasil menghapus kegiatan desa",
    data: deleted,
  };
}
