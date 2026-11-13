import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fotoProfilReorderSchema } from "@/lib/bumdes-foto-profil";
import { cekUrutanIds, urutanDariIndex } from "@/lib/bumdes-foto-urutan";
import { validationFailure } from "../../http";
import { FOTO_AKTIF_WHERE } from "./query";

/** PUT (admin): simpan urutan galeri; body memuat semua id foto aktif, urutan = posisi di daftar. */
export default async function fotoProfilReorder(context: Context) {
  const parsed = fotoProfilReorderSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const { ids } = parsed.data;

  const aktif = await prisma.fotoProfilBumDes.findMany({ where: FOTO_AKTIF_WHERE, select: { id: true } });
  const pesan = cekUrutanIds(ids, aktif.map((f) => f.id));
  if (pesan) {
    context.set.status = 400;
    return { success: false, message: pesan };
  }

  await prisma.$transaction(
    urutanDariIndex(ids).map(({ id, urutan }) =>
      prisma.fotoProfilBumDes.update({ where: { id }, data: { urutan } }),
    ),
  );
  return { success: true, message: "Urutan galeri foto berhasil disimpan", data: { ids } };
}
