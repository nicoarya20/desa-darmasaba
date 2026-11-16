import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "../../fileStorage/_lib/removeReleasedFiles";
import { PUSTU_FILE_OWNER } from "./pustu.data";

/** DELETE (admin): hapus PUSTU; pengurus & galeri ikut terhapus (cascade) beserta semua berkasnya. */
const puskesmasDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const pustu = await prisma.puskesmas.findUnique({
    where: { id },
    select: {
      imageId: true,
      fotoBaganStrukturId: true,
      pengurus: { select: { imageId: true } },
      fotoKegiatan: { select: { imageId: true } },
    },
  });

  if (!pustu) {
    return {
      status: 404,
      body: "PUSTU tidak ditemukan",
    };
  }

  await prisma.puskesmas.delete({
    where: { id },
  });
  await removeReleasedFiles(PUSTU_FILE_OWNER, [
    pustu.imageId,
    pustu.fotoBaganStrukturId,
    ...pustu.pengurus.map((p) => p.imageId),
    ...pustu.fotoKegiatan.map((f) => f.imageId),
  ]);

  return {
    success: true,
    message: "PUSTU dan berkas terkait berhasil dihapus",
  };
};
export default puskesmasDelete;
