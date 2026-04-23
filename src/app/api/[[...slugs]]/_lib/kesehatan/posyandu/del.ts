import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const posyanduDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const posyandu = await prisma.posyandu.findUnique({
    where: { id },
    include: { image: true },
  });

  if (!posyandu) {
    return {
      status: 404,
      body: "Posyandu tidak ditemukan",
    };
  }

  // Hapus file gambar dari filesystem jika ada
  if (posyandu.image) {
    try {
      await minio.removeObject(MINIO_BUCKET, `${posyandu.image.path}/${posyandu.image.name}`);
      await prisma.fileStorage.delete({
        where: { id: posyandu.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  // Hapus berita dari DB
  await prisma.posyandu.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Posyandu dan file terkait berhasil dihapus",
  };
};

export default posyanduDelete;
