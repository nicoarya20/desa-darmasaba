import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function desaDigitalDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const desaDigital = await prisma.desaDigital.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!desaDigital) {
    return {
      status: 404,
      body: "Desa digital tidak ditemukan",
    };
  }

  if (desaDigital.image) {
    try {
      const filePath = path.join(
        desaDigital.image.path,
        desaDigital.image.name
      );
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: desaDigital.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  await prisma.desaDigital.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Desa digital berhasil dihapus",
    status: 200,
  };
}
