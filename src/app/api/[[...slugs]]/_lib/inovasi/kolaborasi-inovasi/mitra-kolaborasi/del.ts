import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function mitraKolaborasiDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const mitraKolaborasi = await prisma.mitraKolaborasi.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!mitraKolaborasi) {
    return {
      status: 404,
      body: "Mitra kolaborasi tidak ditemukan",
    };
  }

  if (mitraKolaborasi.image) {
    try {
      const filePath = path.join(
        mitraKolaborasi.image.path,
        mitraKolaborasi.image.name
      );
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: mitraKolaborasi.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  await prisma.mitraKolaborasi.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Mitra kolaborasi berhasil dihapus",
    status: 200,
  };
}
