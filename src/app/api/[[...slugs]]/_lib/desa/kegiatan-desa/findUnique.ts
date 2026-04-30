import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kegiatanDesaFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  if (!id) {
    return { success: false, message: "ID is required" };
  }

  try {
    const data = await prisma.kegiatanDesa.findUnique({
      where: { id },
      include: {
        kategoriKegiatan: true,
        image: true,
      },
    });

    if (!data) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    return {
      success: true,
      message: "Berhasil ambil kegiatan desa",
      data,
    };
  } catch (e) {
    console.error("Error di kegiatanDesaFindUnique:", e);
    return { success: false, message: "Gagal mengambil data kegiatan desa" };
  }
}

export default kegiatanDesaFindUnique;
