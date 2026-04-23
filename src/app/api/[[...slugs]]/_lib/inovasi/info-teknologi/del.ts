import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

export default async function infoTeknoDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const infoTekno = await prisma.infoTekno.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!infoTekno) {
    return {
      status: 404,
      body: "Info teknologi tidak ditemukan",
    };
  }

  if (infoTekno.image) {
    try {
      await minio.removeObject(MINIO_BUCKET, `${infoTekno.image.path}/${infoTekno.image.name}`);
      await prisma.fileStorage.delete({
        where: { id: infoTekno.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  await prisma.infoTekno.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Info teknologi berhasil dihapus",
    status: 200,
  };
}
