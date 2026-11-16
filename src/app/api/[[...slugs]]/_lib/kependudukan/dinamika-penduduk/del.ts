import prisma from "@/lib/prisma";
import { Context } from "elysia";

/** Hapus permanen dinamika satu tahun (hard delete, sama seperti modul kependudukan lain). */
export default async function dinamikaPendudukDelete(context: Context) {
  const id = context.params?.id as string;

  const existing = await prisma.dinamikaPenduduk.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Data tidak ditemukan" };
  }

  const data = await prisma.dinamikaPenduduk.delete({ where: { id } });
  return { success: true, message: "Data dinamika penduduk berhasil dihapus", data };
}
