import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const fileStorageDelete = async (context: Context) => {
  const id = (context.params as { id: string })?.id;

  if (!id) return { status: 400, body: "ID file tidak ditemukan" };

  const file = await prisma.fileStorage.findUnique({ where: { id } });

  if (!file) return { status: 404, body: "File tidak ditemukan di database" };

  try {
    await minio.removeObject(MINIO_BUCKET, `${file.path}/${file.name}`);
  } catch (err) {
    console.error("Gagal hapus file dari MinIO:", err);
    // Tetap lanjutkan hapus dari database
  }

  await prisma.fileStorage.delete({ where: { id } });

  return { message: "File berhasil dihapus", deletedId: id };
};

export default fileStorageDelete;
