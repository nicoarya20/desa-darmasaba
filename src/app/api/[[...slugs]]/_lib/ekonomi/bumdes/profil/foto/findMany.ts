import prisma from "@/lib/prisma";
import { MAX_FOTO_GALERI } from "@/lib/bumdes-foto-profil";
import { FOTO_AKTIF_WHERE, FOTO_ORDER_BY, FOTO_SELECT } from "./query";

/** GET publik: galeri foto Profil BUMDes yang aktif, terurut; dibatasi MAX_FOTO_GALERI baris. */
export default async function fotoProfilFindMany() {
  const data = await prisma.fotoProfilBumDes.findMany({
    where: FOTO_AKTIF_WHERE,
    orderBy: [...FOTO_ORDER_BY],
    take: MAX_FOTO_GALERI,
    select: FOTO_SELECT,
  });
  return { success: true, message: "Berhasil mengambil galeri foto BUMDes", data };
}
