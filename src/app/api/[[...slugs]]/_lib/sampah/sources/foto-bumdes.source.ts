import prisma from "@/lib/prisma";
import { MAX_FOTO_GALERI } from "@/lib/bumdes-foto-profil";
import { urutanFotoBaru } from "@/lib/bumdes-foto-urutan";
import { FOTO_AKTIF_WHERE } from "../../ekonomi/bumdes/profil/foto/query";
import { createEntitySource } from "./entity.source";
import { ENTITY_FILE_SELECT, idPageWhere, listWhere, TRASHED_ORDER_BY, TRASHED_WHERE } from "./entity-select";
import type { SampahActionResult } from "./types";

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

/** Sumber Sampah: foto galeri Profil BUMDes (profil tunggal, tanpa scope) yang dihapus; judul = keterangan/nama berkas. */
export const fotoBumdesSampahSource = createEntitySource({
  key: "foto-bumdes",
  butuhScope: false,
  count: (filter) => prisma.fotoProfilBumDes.count({ where: listWhere(filter) }),
  async list(filter, skip, take) {
    const rows = await prisma.fotoProfilBumDes.findMany({
      where: listWhere(filter),
      orderBy: [...TRASHED_ORDER_BY],
      skip,
      take,
      select: { id: true, keterangan: true, deletedAt: true, image: { select: { ...ENTITY_FILE_SELECT.select, realName: true } } },
    });
    return rows.map(({ image: { realName, ...file }, ...r }) => ({
      id: r.id,
      judul: r.keterangan?.trim() || realName,
      deletedAt: r.deletedAt as Date,
      folderNama: null,
      file,
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
    const foto = await prisma.fotoProfilBumDes.findFirst({ where: { id, ...TRASHED_WHERE }, select: { image: { select: { id: true } } } });
    return foto ? { file: foto.image } : null;
  },
  async deleteTrashed(id) {
    return (await prisma.fotoProfilBumDes.deleteMany({ where: { id, ...TRASHED_WHERE } })).count;
  },
  restore: (id) => pulihkanFoto(id),
});
