import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { FILE_SELECT } from "./file-check";

/** Detail satu dokumen perencanaan aktif berdasarkan id. */
async function dokumenPerencanaanFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  try {
    const data = await prisma.dokumenPerencanaan.findFirst({
      where: { id, isActive: true },
      include: { file: FILE_SELECT },
    });

    if (!data) {
      context.set.status = 404;
      return { success: false, message: "Dokumen perencanaan tidak ditemukan" };
    }

    return { success: true, message: "Berhasil ambil dokumen perencanaan", data };
  } catch (e) {
    console.error("Error di dokumenPerencanaanFindUnique:", e);
    return { success: false, message: "Gagal mengambil dokumen perencanaan" };
  }
}

export default dokumenPerencanaanFindUnique;
