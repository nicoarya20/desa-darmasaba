import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

const kesejahteraanDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) return { status: 400, body: "ID tidak diberikan" };

  const item = await prisma.kesejahteraanMasyarakat.findUnique({
    where: { id },
    include: { image: true, images: { select: { id: true } } },
  });

  if (!item) return { status: 404, body: "Program kesejahteraan tidak ditemukan" };

  // 1. HAPUS RECORD DULU
  await prisma.kesejahteraanMasyarakat.delete({ where: { id } });

  // 2. BARU PINDAHKAN BERKAS (gambar utama + galeri) KE SAMPAH
  await removeReleasedFiles("KesejahteraanMasyarakat", fileIds(item.imageId, item.images));

  return {
    success: true,
    message: "Program kesejahteraan dan file terkait berhasil dihapus",
  };
};

export default kesejahteraanDelete;
