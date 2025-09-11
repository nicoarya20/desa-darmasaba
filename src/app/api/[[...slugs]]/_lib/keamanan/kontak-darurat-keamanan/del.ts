import prisma from "@/lib/prisma";
import { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function kontakDaruratKeamananDelete(context: Context) {
  const { params } = context;
  const id = params?.id as string;

  if (!id) {
    throw new Error("ID tidak diberikan");
  }

  await prisma.kontakDaruratToItem.deleteMany({
    where: {
      kontakDaruratId: id,
    },
  });

  const kontakDaruratKeamanan = await prisma.kontakDaruratKeamanan.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!kontakDaruratKeamanan) {
    return {
      status: 404,
      body: "Kontak darurat keamanan tidak ditemukan",
    };
  }

  if (kontakDaruratKeamanan.image) {
    try {
      const filePath = path.join(
        kontakDaruratKeamanan.image.path,
        kontakDaruratKeamanan.image.name
      );
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: kontakDaruratKeamanan.image.id },
      });
    } catch (err) {
      console.error("Gagal hapus file image:", err);
    }
  }

  await prisma.kontakDaruratKeamanan.delete({
    where: { id },
  });

  return {
    status: 200,
    success: true,
    message: "Kontak darurat keamanan berhasil dihapus",
  };
}
