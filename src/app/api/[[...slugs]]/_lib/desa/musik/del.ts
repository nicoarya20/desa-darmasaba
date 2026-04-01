import { Context } from "elysia";
import prisma from "@/lib/prisma";
import path from "path";

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
    try {
      const fs = await import("fs/promises");
      const filePath = path.join(musik.audioFile.path, musik.audioFile.name);
      await fs.unlink(filePath);

      await prisma.fileStorage.delete({
        where: { id: musik.audioFile.id },
      });
    } catch (error) {
      console.error("Error deleting audio file:", error);
    }
  }

  // 3. HAPUS FILE COVER (jika ada)
  if (musik.coverImage) {
    try {
      const fs = await import("fs/promises");
      const filePath = path.join(musik.coverImage.path, musik.coverImage.name);
      await fs.unlink(filePath);

      await prisma.fileStorage.delete({
        where: { id: musik.coverImage.id },
      });
    } catch (error) {
      console.error("Error deleting cover image:", error);
    }
  }

  return {
    success: true,
    message: "Musik dan file terkait berhasil dihapus",
  };
};

export default musikDelete;
