import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";

/** Hapus satu entri Inovasi Teknologi Desa beserta gambarnya (bila tidak dirujuk data lain). */
export default async function inovasiTeknologiDelete(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return {
      status: 400,
      body: "ID tidak diberikan",
    };
  }

  const inovasi = await prisma.inovasiTeknologiDesa.findUnique({
    where: { id },
    include: {
      image: true,
    },
  });

  if (!inovasi) {
    return {
      status: 404,
      body: "Inovasi teknologi desa tidak ditemukan",
    };
  }

  await prisma.inovasiTeknologiDesa.delete({
    where: { id },
  });

  if (inovasi.image) {
    await removeStoredFile(inovasi.image, "InovasiTeknologiDesa");
  }

  return {
    success: true,
    message: "Inovasi teknologi desa berhasil dihapus",
    status: 200,
  };
}
