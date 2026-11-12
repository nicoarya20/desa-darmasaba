import type { Context } from "elysia";
import prisma from "@/lib/prisma";
import { DAK_SAMPAH_MAX_DAFTAR, sampahPurgeWhere, toSampahItems } from "@/lib/desa-anti-korupsi-sampah";
import { guardAdmin } from "./admin-guard";
import { dakRetensiHari, pulihkanDokumenDak } from "./sampah-pulihkan";
import { destroySafely } from "../../pengaturan/sampah/sampah.bulk";
import { dokumenDakSampahSource } from "../../pengaturan/sampah/sources/dokumen-dak.source";

/** Ukuran batch ID dokumen kedaluwarsa per query saat pembersihan lazy. */
const PURGE_BATCH = 100;

const SAMPAH_SELECT = {
  id: true,
  judul: true,
  folderId: true,
  folder: { select: { nama: true } },
  file: { select: { id: true, link: true, realName: true, mimeType: true } },
  deletedAt: true,
} as const;

/**
 * Hapus permanen dokumen sampah program yang melewati retensi lewat jalur hapus permanen Sampah yang sama dengan
 * purge global (baris → FileStorage → MinIO; berkas yang masih dirujuk dokumen lain dilewati). Dipaging per ID.
 */
async function purgeDokumenKedaluwarsa(programId: string, now: Date, retensiHari: number) {
  let afterId: string | undefined;
  for (;;) {
    const rows = await prisma.dokumenDesaAntiKorupsi.findMany({
      where: { ...sampahPurgeWhere(programId, now, retensiHari), ...(afterId ? { id: { gt: afterId } } : {}) },
      orderBy: { id: "asc" },
      take: PURGE_BATCH,
      select: { id: true },
    });
    for (const { id } of rows) await destroySafely(dokumenDakSampahSource, id);
    if (rows.length < PURGE_BATCH) return;
    afterId = rows[rows.length - 1].id;
  }
}

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
  const retensi = dakRetensiHari();
  // Pembersihan "lazy" saat panel dibuka (melengkapi purge global harian).
  await purgeDokumenKedaluwarsa(programId, now, retensi);
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

  const result = await pulihkanDokumenDak(context.params.dokumenId);
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
