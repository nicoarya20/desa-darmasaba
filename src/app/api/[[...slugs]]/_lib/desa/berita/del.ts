import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

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
    await removeStoredFile(berita.image, "Berita");
  }

  return {
    success: true,
    message: "Berita dan file terkait berhasil dihapus",
  };
};


export default beritaDelete;
