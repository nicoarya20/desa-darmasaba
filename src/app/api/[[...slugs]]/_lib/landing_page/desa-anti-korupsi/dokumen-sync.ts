import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { applyIsiSync, type IsiSyncStore } from "@/lib/dokumen-folder-sync";
import { prepareIsiSync } from "@/lib/dokumen-folder-prepare";
import type {
  ProgramIsiInput,
  ProgramIsiTersimpan,
  ProgramSyncPlan,
  ProgramSyncResult,
} from "@/lib/desa-anti-korupsi-sync";

/** Folder & dokumen aktif milik program; program baru (id null) → kosong. */
async function loadIsiTersimpan(programId: string | null): Promise<ProgramIsiTersimpan> {
  if (!programId) return { folders: [], dokumen: [] };
  const where = { desaAntiKorupsiId: programId, isActive: true };
  const [folders, dokumen] = await Promise.all([
    prisma.folderDokumenDesaAntiKorupsi.findMany({ where, select: { id: true, nama: true, urutan: true } }),
    prisma.dokumenDesaAntiKorupsi.findMany({
      where,
      select: { id: true, fileId: true, judul: true, urutan: true, folderId: true },
    }),
  ]);
  return { folders, dokumen };
}

/** Validasi payload folder + dokumen, hitung rencana sinkron terhadap isi tersimpan, lalu cek berkas baru. */
export async function prepareProgramSync(
  programId: string | null,
  input: ProgramIsiInput,
): Promise<ProgramSyncResult> {
  return prepareIsiSync(() => loadIsiTersimpan(programId), input);
}

/** Akses tabel folder + dokumen DAK untuk satu program di dalam transaksi. */
function dakIsiStore(tx: Prisma.TransactionClient, programId: string): IsiSyncStore {
  const scope = { desaAntiKorupsiId: programId };
  return {
    createFolder: (data) =>
      tx.folderDokumenDesaAntiKorupsi.create({ data: { ...scope, ...data }, select: { id: true } }),
    updateFolder: (id, data) => tx.folderDokumenDesaAntiKorupsi.update({ where: { id }, data }),
    releaseFolderDokumen: (folderIds) =>
      tx.dokumenDesaAntiKorupsi.updateMany({ where: { ...scope, folderId: { in: folderIds } }, data: { folderId: null } }),
    softDeleteFolders: (folderIds, now) =>
      tx.folderDokumenDesaAntiKorupsi.updateMany({
        where: { ...scope, id: { in: folderIds } },
        data: { isActive: false, deletedAt: now },
      }),
    softDeleteDokumen: (ids, now) =>
      tx.dokumenDesaAntiKorupsi.updateMany({ where: { ...scope, id: { in: ids } }, data: { isActive: false, deletedAt: now } }),
    updateDokumen: (id, data) => tx.dokumenDesaAntiKorupsi.update({ where: { id }, data }),
    createDokumen: (rows) => tx.dokumenDesaAntiKorupsi.createMany({ data: rows.map((r) => ({ ...scope, ...r })) }),
  };
}

/** Tulis rencana sinkron isi program DAK di dalam transaksi (urutan langkah: lihat `applyIsiSync`). */
export async function applyProgramSync(
  tx: Prisma.TransactionClient,
  programId: string,
  plan: ProgramSyncPlan,
): Promise<void> {
  await applyIsiSync(dakIsiStore(tx, programId), plan);
}
