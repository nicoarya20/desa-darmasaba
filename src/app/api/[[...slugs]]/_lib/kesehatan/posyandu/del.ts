import prisma from "@/lib/prisma";
import fs from "fs/promises";
import { Context } from "elysia";
import path from "path";

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
      const filePath = path.join(posyandu.image.path, posyandu.image.name);
      await fs.unlink(filePath);
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
