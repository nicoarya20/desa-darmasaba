import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fotoProfilUpdateSchema } from "@/lib/bumdes-foto-profil";
import { validationFailure } from "../../http";
import { FOTO_AKTIF_WHERE, FOTO_SELECT } from "./query";

/** PUT (admin): ubah keterangan satu foto galeri; 404 bila foto tidak ada atau sudah dihapus. */
export default async function fotoProfilUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const parsed = fotoProfilUpdateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  const existing = await prisma.fotoProfilBumDes.findFirst({
    where: { id, ...FOTO_AKTIF_WHERE },
    select: { id: true },
  });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: "Foto galeri tidak ditemukan" };
  }

  const data = await prisma.fotoProfilBumDes.update({
    where: { id },
    data: { keterangan: parsed.data.keterangan },
    select: FOTO_SELECT,
  });
  return { success: true, message: "Keterangan foto berhasil disimpan", data };
}
