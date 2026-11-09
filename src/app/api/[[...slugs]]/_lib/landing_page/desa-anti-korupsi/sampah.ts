import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import {
  DAK_SAMPAH_MAX_DAFTAR,
  planPulihkan,
  resolveRetensiHari,
  sampahCutoff,
  sampahPurgeWhere,
  toSampahItems,
} from "@/lib/desa-anti-korupsi-sampah";
import { guardAdmin } from "./admin-guard";

const SAMPAH_SELECT = {
  id: true,
  judul: true,
  folderId: true,
  folder: { select: { nama: true } },
  file: { select: { id: true, link: true, realName: true, mimeType: true } },
  deletedAt: true,
} as const;

const retensiHari = () => resolveRetensiHari(process.env.DAK_SAMPAH_RETENSI_HARI);

const gagal = (set: Context["set"], status: number, message: string) => {
  set.status = status;
  return { success: false as const, message };
};

/** Admin: daftar sampah program (terbaru dulu); dokumen yang melewati retensi dihapus permanen lebih dulu. */
export async function desaAntiKorupsiSampahList(context: Context) {
  const denied = await guardAdmin(context.set);
  if (denied) return denied;

  const programId = context.params.id;
  const program = await prisma.desaAntiKorupsi.findUnique({ where: { id: programId }, select: { id: true } });
  if (!program) return gagal(context.set, 404, "Desa anti korupsi tidak ditemukan");

  const now = new Date();
  const retensi = retensiHari();
  // Pembersihan "lazy" (tanpa cron). Objek MinIO tidak dihapus: FileStorage bisa dipakai dokumen lain.
  await prisma.dokumenDesaAntiKorupsi.deleteMany({ where: sampahPurgeWhere(programId, now, retensi) });
  const rows = await prisma.dokumenDesaAntiKorupsi.findMany({
    where: { desaAntiKorupsiId: programId, isActive: false, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    take: DAK_SAMPAH_MAX_DAFTAR,
    select: SAMPAH_SELECT,
  });
  return { success: true as const, data: toSampahItems(rows, now, retensi) };
}

/** Admin: pulihkan dokumen dari sampah ke folder asal (bila masih aktif) atau "Umum", di akhir folder. */
export async function desaAntiKorupsiSampahPulihkan(context: Context) {
  const denied = await guardAdmin(context.set);
  if (denied) return denied;

  const id = context.params.dokumenId;
  const cutoff = sampahCutoff(new Date(), retensiHari());
  const result = await prisma.$transaction(async (tx) => {
    // Dokumen yang sudah melewati retensi dianggap hilang walau belum dibersihkan.
    const doc = await tx.dokumenDesaAntiKorupsi.findFirst({
      where: { id, isActive: false, deletedAt: { gt: cutoff } },
      select: {
        id: true,
        desaAntiKorupsiId: true,
        fileId: true,
        folderId: true,
        folder: { select: { isActive: true } },
        file: { select: { isActive: true } },
      },
    });
    if (!doc) return { ok: false, status: 404, message: "Dokumen tidak ada di tempat sampah" } as const;

    const aktif = await tx.dokumenDesaAntiKorupsi.findMany({
      where: { desaAntiKorupsiId: doc.desaAntiKorupsiId, isActive: true },
      select: { folderId: true, fileId: true, urutan: true },
    });
    const plan = planPulihkan(
      { fileId: doc.fileId, folderId: doc.folderId, folderAktif: doc.folder?.isActive === true, fileAktif: doc.file.isActive },
      aktif,
    );
    if (!plan.ok) return { ok: false, status: 409, message: plan.message } as const;

    await tx.dokumenDesaAntiKorupsi.update({
      where: { id },
      data: { isActive: true, deletedAt: null, folderId: plan.folderId, urutan: plan.urutan },
    });
    return { ok: true, data: { id: doc.id, folderId: plan.folderId } } as const;
  });

  if (!result.ok) return gagal(context.set, result.status, result.message);
  return { success: true as const, data: result.data };
}

/** Admin: hapus permanen satu dokumen yang sudah ada di sampah (dokumen aktif tidak tersentuh → 404). */
export async function desaAntiKorupsiSampahHapus(context: Context) {
  const denied = await guardAdmin(context.set);
  if (denied) return denied;

  const id = context.params.dokumenId;
  const { count } = await prisma.dokumenDesaAntiKorupsi.deleteMany({ where: { id, isActive: false } });
  if (count === 0) return gagal(context.set, 404, "Dokumen tidak ada di tempat sampah");
  return { success: true as const, data: { id } };
}
