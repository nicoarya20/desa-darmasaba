import prisma from "@/lib/prisma";
import { MAX_FOTO_GALERI } from "@/lib/bumdes-foto-profil";
import { urutanFotoBaru } from "@/lib/bumdes-foto-urutan";
import { FOTO_AKTIF_WHERE } from "../../../ekonomi/bumdes/profil/foto/query";
import { createEntitySource } from "./entity.source";
import { ENTITY_FILE_SELECT, idPageWhere, TRASHED_ORDER_BY, TRASHED_WHERE } from "./entity-select";
import type { SampahActionResult } from "./types";

const cariWhere = (cari: string) =>
  cari
    ? {
        OR: [
          { keterangan: { contains: cari, mode: "insensitive" as const } },
          { image: { realName: { contains: cari, mode: "insensitive" as const } } },
        ],
      }
    : {};

/** Pulihkan foto galeri ke posisi terakhir; ditolak bila berkasnya sudah tidak aktif atau galeri penuh. */
async function pulihkanFoto(id: string): Promise<SampahActionResult> {
  const foto = await prisma.fotoProfilBumDes.findFirst({
    where: { id, ...TRASHED_WHERE },
    select: { image: { select: { isActive: true } } },
  });
  if (!foto) return { ok: false, status: 404, message: "Foto tidak ada di Sampah" };
  if (!foto.image.isActive) return { ok: false, status: 409, message: "Berkas foto sudah dihapus sehingga tidak bisa dipulihkan" };

  const [jumlah, { _max }] = await Promise.all([
    prisma.fotoProfilBumDes.count({ where: FOTO_AKTIF_WHERE }),
    prisma.fotoProfilBumDes.aggregate({ where: FOTO_AKTIF_WHERE, _max: { urutan: true } }),
  ]);
  if (jumlah >= MAX_FOTO_GALERI) return { ok: false, status: 409, message: `Galeri sudah berisi ${MAX_FOTO_GALERI} foto (batas maksimal)` };

  await prisma.fotoProfilBumDes.update({
    where: { id },
    data: { isActive: true, deletedAt: null, urutan: urutanFotoBaru(_max.urutan, 1)[0] },
  });
  return { ok: true, message: "Foto dipulihkan ke galeri BUMDes" };
}

/** Sumber Sampah: foto galeri Profil BUMDes yang dihapus (judul = keterangan, atau nama berkas). */
export const fotoBumdesSampahSource = createEntitySource({
  key: "bumdes-foto",
  menuId: "ekonomi.bumdes",
  count: (cari) => prisma.fotoProfilBumDes.count({ where: { ...TRASHED_WHERE, ...cariWhere(cari) } }),
  async list(cari, take) {
    const rows = await prisma.fotoProfilBumDes.findMany({
      where: { ...TRASHED_WHERE, ...cariWhere(cari) },
      orderBy: [...TRASHED_ORDER_BY],
      take,
      select: { id: true, keterangan: true, deletedAt: true, image: { select: { ...ENTITY_FILE_SELECT.select, realName: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      judul: r.keterangan?.trim() || r.image.realName,
      deletedAt: r.deletedAt as Date,
      file: r.image,
    }));
  },
  async findIds(deletedBefore, take, afterId) {
    const rows = await prisma.fotoProfilBumDes.findMany({
      where: idPageWhere(deletedBefore, afterId),
      orderBy: { id: "asc" },
      take,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },
  async findTrashed(id) {
    const foto = await prisma.fotoProfilBumDes.findFirst({ where: { id, ...TRASHED_WHERE }, select: { image: ENTITY_FILE_SELECT } });
    return foto ? { file: foto.image } : null;
  },
  async deleteTrashed(id) {
    return (await prisma.fotoProfilBumDes.deleteMany({ where: { id, ...TRASHED_WHERE } })).count;
  },
  restore: (id) => pulihkanFoto(id),
});
