import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { FOTO_AKTIF_WHERE } from "./query";

/**
 * DELETE (admin): soft delete satu foto galeri (deletedAt + isActive=false).
 * FileStorage/MinIO sengaja tidak dihapus: menghapus berkas akan meng-cascade baris ini
 * sehingga soft delete tidak bermakna.
 */
export default async function fotoProfilDelete(context: Context) {
  const { id } = context.params as { id: string };

  const existing = await prisma.fotoProfilBumDes.findFirst({
    where: { id, ...FOTO_AKTIF_WHERE },
    select: { id: true },
  });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Foto galeri tidak ditemukan" };
  }

  await prisma.fotoProfilBumDes.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  return { success: true, message: "Foto berhasil dihapus dari galeri", data: { id, deleted: true } };
}
