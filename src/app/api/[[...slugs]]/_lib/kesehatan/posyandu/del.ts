import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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

  // Hapus berita dari DB
  await prisma.posyandu.delete({
    where: { id },
  });

  // Hapus file gambar dari filesystem jika ada
  if (posyandu.image) {
    await removeStoredFile(posyandu.image, "Posyandu");
  }

  return {
    success: true,
    message: "Posyandu dan file terkait berhasil dihapus",
  };
};

export default posyanduDelete;
