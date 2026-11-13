import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

export default async function programInovasiDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak ditemukan dalam parameter");
  }

  // Galeri (m2m implisit) dibaca sebelum delete karena baris relasinya ikut terhapus.
  const galeri = await prisma.programInovasi.findUnique({
    where: { id },
    select: { images: { select: { id: true } } },
  });

  const deleted = await prisma.programInovasi.delete({
    where: { id },
  });
  await removeReleasedFiles("ProgramInovasi", fileIds(deleted.imageId, galeri?.images ?? []));

  return {
    success: true,
    message: "Berhasil menghapus program inovasi",
    data: deleted,
  };
}
