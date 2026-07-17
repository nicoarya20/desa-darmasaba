import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const kesejahteraanDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) return { status: 400, body: "ID tidak diberikan" };

  const item = await prisma.kesejahteraanMasyarakat.findUnique({
    where: { id },
    include: { image: true },
  });

  if (!item) return { status: 404, body: "Program kesejahteraan tidak ditemukan" };

  // 1. HAPUS RECORD DULU
  await prisma.kesejahteraanMasyarakat.delete({ where: { id } });

  // 2. BARU HAPUS FILE
  if (item.image) {
    try {
      await minio.removeObject(
        MINIO_BUCKET,
        `${item.image.path}/${item.image.name}`,
      );
      await prisma.fileStorage.delete({
        where: { id: item.image.id },
      });
    } catch (err) {
      console.error("Gagal hapus file image dari MinIO/DB:", err);
    }
  }

  return {
    success: true,
    message: "Program kesejahteraan dan file terkait berhasil dihapus",
  };
};

export default kesejahteraanDelete;
