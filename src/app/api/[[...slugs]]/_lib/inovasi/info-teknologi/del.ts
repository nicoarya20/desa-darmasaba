import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

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
      const filePath = path.join(
        infoTekno.image.path,
        infoTekno.image.name
      );
      await fs.unlink(filePath);
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
