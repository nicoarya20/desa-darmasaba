import prisma from "@/lib/prisma";
import { Context } from "elysia";

/** Admin: soft delete dokumen perencanaan (isActive=false + deletedAt). */
async function dokumenPerencanaanDelete(context: Context) {
  const { id } = context.params as { id: string };

  try {
    const result = await prisma.dokumenPerencanaan.updateMany({
      where: { id, isActive: true },
      data: { isActive: false, deletedAt: new Date() },
    });

    if (result.count === 0) {
      context.set.status = 404;
      return { success: false, message: "Dokumen perencanaan tidak ditemukan" };
    }
    return { success: true, message: "Dokumen perencanaan berhasil dihapus" };
  } catch (e) {
    console.error("Error di dokumenPerencanaanDelete:", e);
    return { success: false, message: "Gagal menghapus dokumen perencanaan" };
  }
}

export default dokumenPerencanaanDelete;
