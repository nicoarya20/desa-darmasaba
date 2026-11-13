import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

const puskesmasDelete = async (context: Context) => {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const puskesmas = await prisma.puskesmas.findUnique({
    where: { id },
    include: { image: true, kontak: true, jam: true },
  });

  if (!puskesmas) {
    return {
      status: 404,
      body: "Puskesmas tidak ditemukan",
    };
  }

  await prisma.puskesmas.delete({
    where: { id },
  })

  if (puskesmas.image) {
    await removeStoredFile(puskesmas.image, "Puskesmas");
  }

  return {
    success: true,
    message: "Puskesmas dan file terkait berhasil dihapus",
  }
};
export default puskesmasDelete;