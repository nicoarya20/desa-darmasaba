import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { MAX_FOTO_GALERI, fotoProfilCreateSchema } from "@/lib/bumdes-foto-profil";
import { urutanFotoBaru } from "@/lib/bumdes-foto-urutan";
import { PROFIL_BUMDES_ID } from "@/lib/bumdes-profil";
import { validationFailure, writeFailure } from "../../http";
import { FOTO_AKTIF_WHERE, FOTO_SELECT } from "./query";

/**
 * POST (admin): tambah beberapa foto galeri sekaligus, ditaruh setelah foto terakhir.
 * Ditolak 400 bila profil BUMDes belum diisi (foto butuh baris profil) atau galeri melewati batas.
 */
export default async function fotoProfilCreate(context: Context) {
  const parsed = fotoProfilCreateSchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);
  const { items } = parsed.data;

  const profil = await prisma.profilBumDes.findFirst({
    where: { id: PROFIL_BUMDES_ID, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!profil) {
    context.set.status = 400;
    return { success: false, message: "Isi profil BUMDes dulu sebelum menambah galeri foto" };
  }

  const [jumlah, { _max }] = await Promise.all([
    prisma.fotoProfilBumDes.count({ where: FOTO_AKTIF_WHERE }),
    prisma.fotoProfilBumDes.aggregate({ where: FOTO_AKTIF_WHERE, _max: { urutan: true } }),
  ]);
  if (jumlah + items.length > MAX_FOTO_GALERI) {
    context.set.status = 400;
    const sisa = Math.max(0, MAX_FOTO_GALERI - jumlah);
    return { success: false, message: `Galeri maksimal ${MAX_FOTO_GALERI} foto; sisa slot ${sisa} foto` };
  }

  const urutan = urutanFotoBaru(_max.urutan, items.length);
  try {
    const data = await prisma.$transaction(
      items.map((item, i) =>
        prisma.fotoProfilBumDes.create({
          data: { profilId: PROFIL_BUMDES_ID, imageId: item.imageId, keterangan: item.keterangan, urutan: urutan[i] },
          select: FOTO_SELECT,
        }),
      ),
    );
    return { success: true, message: `${data.length} foto berhasil ditambahkan ke galeri`, data };
  } catch (error) {
    return writeFailure(error, context);
  }
}
