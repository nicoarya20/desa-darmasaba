import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import type { FolderInput } from "@/lib/desa-anti-korupsi-folder";
import type { ProgramIsiInput, ProgramIsiTersimpan, ProgramSyncPlan, ProgramSyncResult } from "@/lib/desa-anti-korupsi-sync";
import { prepareIsiSync } from "@/lib/dokumen-folder-prepare";
import { applyIsiSync, type IsiSyncStore } from "@/lib/dokumen-folder-sync";

/** Bagian body create/update APBDes untuk isi dokumen (bentuk sama dengan DAK). */
export type ApbdesIsiBody = { folders?: FolderInput[]; dokumen?: DokumenInput[] };

/** Folder & dokumen aktif milik satu APBDes; APBDes baru (id null) → kosong. */
async function loadApbdesIsi(apbdesId: string | null): Promise<ProgramIsiTersimpan> {
  if (!apbdesId) return { folders: [], dokumen: [] };
  const where = { apbdesId, isActive: true };
  const [folders, dokumen] = await Promise.all([
    prisma.folderDokumenAPBDes.findMany({ where, select: { id: true, nama: true, urutan: true } }),
    prisma.dokumenAPBDes.findMany({
      where,
      select: { id: true, fileId: true, judul: true, urutan: true, folderId: true },
    }),
  ]);
  return { folders, dokumen };
}

/** Validasi `folders`/`dokumen` body terhadap isi tersimpan APBDes; tidak dikirim keduanya = rencana kosong. */
export async function prepareApbdesIsiSync(
  apbdesId: string | null,
  input: ProgramIsiInput,
): Promise<ProgramSyncResult> {
  return prepareIsiSync(() => loadApbdesIsi(apbdesId), input);
}

/** Akses tabel folder + dokumen untuk satu APBDes di dalam transaksi (semua tulis ter-scope apbdesId). */
function apbdesIsiStore(tx: Prisma.TransactionClient, apbdesId: string): IsiSyncStore {
  const scope = { apbdesId };
  return {
    createFolder: (data) => tx.folderDokumenAPBDes.create({ data: { ...scope, ...data }, select: { id: true } }),
    updateFolder: (id, data) => tx.folderDokumenAPBDes.update({ where: { id }, data }),
    releaseFolderDokumen: (folderIds) =>
      tx.dokumenAPBDes.updateMany({ where: { ...scope, folderId: { in: folderIds } }, data: { folderId: null } }),
    softDeleteFolders: (folderIds, now) =>
      tx.folderDokumenAPBDes.updateMany({
        where: { ...scope, id: { in: folderIds } },
        data: { isActive: false, deletedAt: now },
      }),
    softDeleteDokumen: (ids, now) =>
      tx.dokumenAPBDes.updateMany({ where: { ...scope, id: { in: ids } }, data: { isActive: false, deletedAt: now } }),
    updateDokumen: (id, data) => tx.dokumenAPBDes.update({ where: { id }, data }),
    createDokumen: (rows) => tx.dokumenAPBDes.createMany({ data: rows.map((r) => ({ ...scope, ...r })) }),
  };
}

/**
 * Tulis rencana sinkron isi APBDes di dalam transaksi. Bila daftar dokumen dikirim, daftar itu jadi
 * sumber kebenaran: `APBDes.fileId` lama dikosongkan (isinya sudah disalin migrasi ke DokumenAPBDes)
 * supaya fallback publik tidak memunculkan lagi berkas yang sudah dihapus admin. FileStorage tidak
 * pernah dihapus di sini — dokumen hanya di-soft-delete.
 */
export async function applyApbdesIsiSync(
  tx: Prisma.TransactionClient,
  apbdesId: string,
  plan: ProgramSyncPlan,
): Promise<void> {
  await applyIsiSync(apbdesIsiStore(tx, apbdesId), plan);
  if (plan.dokumen) await tx.aPBDes.update({ where: { id: apbdesId }, data: { fileId: null } });
}
