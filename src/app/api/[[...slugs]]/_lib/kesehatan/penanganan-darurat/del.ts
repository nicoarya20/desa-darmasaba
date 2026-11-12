import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const penangananDaruratDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const penangananDarurat = await prisma.penangananDarurat.findUnique({
    where: { id },
    include: { image: true },
  });
  if (!penangananDarurat) {
    return {
      status: 404,
      body: "Penanganan darurat tidak ditemukan",
    };
  }

  // Hapus data dari database
  await prisma.penangananDarurat.delete({
    where: { id },
  });

  // Hapus file gambar dari filesystem jika ada
  if (penangananDarurat.image) {
    await removeStoredFile(penangananDarurat.image, "PenangananDarurat");
  }

  return {
    status: 200,
    success: true,
    message: "Penanganan darurat dan file terkait berhasil dihapus",
  };
};
export default penangananDaruratDelete;
