import prisma from "@/lib/prisma";
import { Context } from "elysia";

async function kegiatanDesaDelete(context: Context) {
  const { id } = context.params as { id: string };

  try {
    await prisma.kegiatanDesa.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, message: "Kegiatan desa berhasil dihapus" };
  } catch (e) {
    console.error("Error di kegiatanDesaDelete:", e);
    return { success: false, message: "Gagal menghapus kegiatan desa" };
  }
}

export default kegiatanDesaDelete;
