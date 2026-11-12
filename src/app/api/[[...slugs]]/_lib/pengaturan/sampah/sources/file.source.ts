import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { kelompokIdOfMenu, knownSampahMenuIds, menuIdsOfKelompok, SAMPAH_KELOMPOK_LAINNYA, SAMPAH_KELOMPOK_SEMUA } from "@/lib/sampah/sampah-kelompok";
import { SAMPAH_RETENSI_HARI } from "@/lib/sampah/sampah-retensi";
import { purgeStoredFile } from "../../../fileStorage/_lib/purgeStoredFile";
import type { SampahSource } from "./types";

// Berkas milik entitas yang sedang soft-delete tampil sebagai item entitas, bukan item berkas (hindari dobel).
const BUKAN_MILIK_ENTITAS_TERHAPUS: Prisma.FileStorageWhereInput = {
  DokumenDesaAntiKorupsi: { none: { deletedAt: { not: null } } },
  DokumenAPBDes: { none: { deletedAt: { not: null } } },
  FotoProfilBumDes: { none: { deletedAt: { not: null } } },
  DokumenPerencanaan: { none: { deletedAt: { not: null } } },
};

/** Filter `deletedFrom` untuk satu kelompok; "lainnya" = kosong atau di luar menu sidebar yang dikenal. */
function kelompokWhere(kelompok: string): Prisma.FileStorageWhereInput {
  if (kelompok === SAMPAH_KELOMPOK_SEMUA) return {};
  if (kelompok === SAMPAH_KELOMPOK_LAINNYA.id) {
    return { OR: [{ deletedFrom: null }, { deletedFrom: { notIn: knownSampahMenuIds() } }] };
  }
  return { deletedFrom: { in: menuIdsOfKelompok(kelompok) } };
}

function sampahWhere(kelompok: string, cari: string): Prisma.FileStorageWhereInput {
  return {
    deletedAt: { not: null },
    ...BUKAN_MILIK_ENTITAS_TERHAPUS,
    ...(cari ? { realName: { contains: cari, mode: "insensitive" } } : {}),
    AND: [kelompokWhere(kelompok)],
  };
}

const KEY = "file";

/** Sumber Sampah: baris FileStorage yang dipindah ke Sampah (`removeStoredFile` / hapus dari pustaka). */
export const fileSampahSource: SampahSource = {
  key: KEY,
  retensiHari: () => SAMPAH_RETENSI_HARI,

  async countByKelompok(cari) {
    const groups = await prisma.fileStorage.groupBy({
      by: ["deletedFrom"],
      where: sampahWhere(SAMPAH_KELOMPOK_SEMUA, cari),
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const g of groups) {
      const kelompokId = kelompokIdOfMenu(g.deletedFrom);
      counts[kelompokId] = (counts[kelompokId] ?? 0) + g._count._all;
    }
    return counts;
  },

  async list({ kelompok, cari }, take) {
    const rows = await prisma.fileStorage.findMany({
      where: sampahWhere(kelompok, cari),
      orderBy: [{ deletedAt: "desc" }, { id: "asc" }],
      take,
      select: { id: true, realName: true, mimeType: true, category: true, size: true, deletedAt: true, deletedFrom: true },
    });
    return rows.map((r) => ({
      sumber: KEY,
      id: r.id,
      jenis: "file" as const,
      judul: r.realName,
      deletedAt: r.deletedAt as Date,
      menuId: r.deletedFrom,
      file: { mimeType: r.mimeType, category: r.category, size: r.size },
    }));
  },

  async findIds({ kelompok, deletedBefore }, take, afterId) {
    const rows = await prisma.fileStorage.findMany({
      where: {
        ...sampahWhere(kelompok, ""),
        ...(deletedBefore ? { deletedAt: { lt: deletedBefore } } : {}),
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      orderBy: { id: "asc" },
      take,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },

  async restore(id) {
    const { count } = await prisma.fileStorage.updateMany({
      where: { id, deletedAt: { not: null } },
      data: { deletedAt: null, isActive: true, deletedFrom: null },
    });
    return count === 0
      ? { ok: false, status: 404, message: "Berkas tidak ada di Sampah" }
      : { ok: true, message: "Berkas dipulihkan ke pustaka file" };
  },

  async destroy(id) {
    const file = await prisma.fileStorage.findFirst({ where: { id, deletedAt: { not: null } }, select: { id: true } });
    if (!file) return { ok: false, status: 404, message: "Berkas tidak ada di Sampah" };
    const result = await purgeStoredFile(id);
    if (result === "referenced") return { ok: false, status: 409, message: "Berkas masih dipakai data lain" };
    if (result === "missing") return { ok: false, status: 404, message: "Berkas tidak ada di Sampah" };
    return { ok: true, message: "Berkas dihapus permanen" };
  },

  previewFile(id) {
    return prisma.fileStorage.findFirst({
      where: { id, deletedAt: { not: null } },
      select: { path: true, name: true, mimeType: true },
    });
  },
};
