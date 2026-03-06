import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

const beritaDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) return { status: 400, body: "ID tidak diberikan" };

  const berita = await prisma.berita.findUnique({
    where: { id },
    include: { image: true, kategoriBerita: true },
  });

  if (!berita) return { status: 404, body: "Berita tidak ditemukan" };

  // 1. HAPUS BERITA DULU
  await prisma.berita.delete({ where: { id } });

  // 2. BARU HAPUS FILE
  if (berita.image) {
    try {
      const filePath = path.join(berita.image.path, berita.image.name);
      await fs.unlink(filePath);

      await prisma.fileStorage.delete({
        where: { id: berita.image.id },
      });
    } catch (err) {
      console.error("Gagal hapus file image:", err);
    }
  }

  return {
    success: true,
    message: "Berita dan file terkait berhasil dihapus",
  };
};


export default beritaDelete;
