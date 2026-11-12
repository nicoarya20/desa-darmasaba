import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

  await prisma.pengaduanMasyarakat.delete({
    where: { id },
  });

  if (pengaduan.image) {
    await removeStoredFile(pengaduan.image, "PengaduanMasyarakat");
  }

  return {
    success: true,
    message: "Pengaduan masyarakat berhasil dihapus",
    status: 200,
  };
}
