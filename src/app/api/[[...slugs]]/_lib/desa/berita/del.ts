import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

const beritaDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) return { status: 400, body: "ID tidak diberikan" };

  const berita = await prisma.berita.findUnique({
    where: { id },
    include: { image: true, images: { select: { id: true } }, kategoriBerita: true },
  });

  if (!berita) return { status: 404, body: "Berita tidak ditemukan" };

  // 1. HAPUS BERITA DULU
  await prisma.berita.delete({ where: { id } });

  // 2. BARU PINDAHKAN BERKAS (gambar utama + galeri) KE SAMPAH
  await removeReleasedFiles("Berita", fileIds(berita.imageId, berita.images));

  return {
    success: true,
    message: "Berita dan file terkait berhasil dihapus",
  };
};


export default beritaDelete;
