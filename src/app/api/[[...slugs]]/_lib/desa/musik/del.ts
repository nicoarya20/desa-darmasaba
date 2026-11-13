import { Context } from "elysia";
import prisma from "@/lib/prisma";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const musikDelete = async (context: Context) => {
  const { id } = context.params as { id: string };

  const musik = await prisma.musikDesa.findUnique({
    where: { id },
    include: { audioFile: true, coverImage: true },
  });

  if (!musik) return { status: 404, body: "Musik tidak ditemukan" };

  // 1. HAPUS MUSIK DULU
  await prisma.musikDesa.delete({ where: { id } });

  // 2. HAPUS FILE AUDIO (jika ada)
  if (musik.audioFile) {
    await removeStoredFile(musik.audioFile, "MusikDesa");
  }

  // 3. HAPUS FILE COVER (jika ada)
  if (musik.coverImage) {
    await removeStoredFile(musik.coverImage, "MusikDesa");
  }

  return {
    success: true,
    message: "Musik dan file terkait berhasil dihapus",
  };
};

export default musikDelete;
