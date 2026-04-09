import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import fs from "fs/promises";
import path from "path";

export default async function pengaduanMasyarakatDelete(context: Context) {
  const id = context.params?.id as string;

  const pengaduan = await prisma.pengaduanMasyarakat.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
      jenisPengaduan: true,
    },
  });

  if (!pengaduan) {
    return {
      status: 404,
      body: "Pengaduan masyarakat tidak ditemukan",
    };
  }

  if (pengaduan.image) {
    try {
      const filePath = path.join(pengaduan.image.path, pengaduan.image.name);
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: pengaduan.image.id },
      });
    } catch (error) {
      console.error("Gagal hapus file image:", error);
    }
  }

  await prisma.pengaduanMasyarakat.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Pengaduan masyarakat berhasil dihapus",
    status: 200,
  };
}
