import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import path from "path";
import fs from "fs/promises";

const puskesmasDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const puskesmas = await prisma.puskesmas.findUnique({
    where: { id },
    include: { image: true, kontak: true, jam: true },
  });

  if (!puskesmas) {
    return {
      status: 404,
      body: "Puskesmas tidak ditemukan",
    };
  }

  if (puskesmas.image) {
    try {
      const filePath = path.join(puskesmas.image.path, puskesmas.image.name);
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: puskesmas.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  await prisma.puskesmas.delete({
    where: { id },
  })

  return {
    success: true,
    message: "Puskesmas dan file terkait berhasil dihapus",
  }
};
export default puskesmasDelete;