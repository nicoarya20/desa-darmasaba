import prisma from "@/lib/prisma";
import { Context } from "elysia";
import minio, { MINIO_BUCKET } from "@/lib/minio";

const penangananDaruratDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const penangananDarurat = await prisma.penangananDarurat.findUnique({
    where: { id },
    include: { image: true },
  });
  if (!penangananDarurat) {
    return {
      status: 404,
      body: "Penanganan darurat tidak ditemukan",
    };
  }

  // Hapus file gambar dari filesystem jika ada
  if (penangananDarurat.image) {
    try {
      await minio.removeObject(MINIO_BUCKET, `${penangananDarurat.image.path}/${penangananDarurat.image.name}`);
      await prisma.fileStorage.delete({
        where: { id: penangananDarurat.image.id },
      });
    } catch (error) {
      console.error("Error deleting image file:", error);
    }
  }

  // Hapus data dari database
  await prisma.penangananDarurat.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Penanganan darurat dan file terkait berhasil dihapus",
  };
};
export default penangananDaruratDelete;
