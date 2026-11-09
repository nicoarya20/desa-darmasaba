import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { resolveFolderId } from "@/lib/desa-anti-korupsi-folder";
import {
  planProgramSync,
  type ProgramIsiInput,
  type ProgramIsiTersimpan,
  type ProgramSyncPlan,
  type ProgramSyncResult,
} from "@/lib/desa-anti-korupsi-sync";

/** Pastikan semua fileId menunjuk berkas aktif di FileStorage; kembalikan pesan error atau null. */
export async function checkDokumenFiles(fileIds: string[]): Promise<string | null> {
  // Berkas yang sama boleh dipakai di beberapa folder; count() menghitung berkas unik.
  const unique = [...new Set(fileIds)];
  if (unique.length === 0) return null;
  const found = await prisma.fileStorage.count({
    where: { id: { in: unique }, isActive: true },
  });
  return found === unique.length ? null : "File dokumen tidak ditemukan atau sudah dihapus";
}

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
  if (input.folders === undefined && input.dokumen === undefined) {
    return { ok: true, plan: { folders: null, dokumen: null } };
  }
  const planned = planProgramSync(await loadIsiTersimpan(programId), input);
  if (!planned.ok) return planned;

  const fileError = await checkDokumenFiles(planned.plan.dokumen?.create.map((d) => d.fileId) ?? []);
  if (fileError) return { ok: false, message: fileError };

  return planned;
}

/**
 * Tulis rencana sinkron di dalam transaksi. Urutan penting: folder baru dibuat dulu (tempKey → id),
 * folder yang dihapus melepas dokumennya ke "Umum" sebelum di-soft-delete, baru dokumen disinkronkan
 * (dokumen yang dipindah keluar dari folder terhapus tetap mendapat folder tujuannya).
 */
export async function applyProgramSync(
  tx: Prisma.TransactionClient,
  programId: string,
  plan: ProgramSyncPlan,
): Promise<void> {
  const now = new Date();
  let createdIds = new Map<string, string>();

  if (plan.folders) {
    const { create, update, remove } = plan.folders;
    const created = await Promise.all(
      create.map(async (f) => {
        const row = await tx.folderDokumenDesaAntiKorupsi.create({
          data: { desaAntiKorupsiId: programId, nama: f.nama, urutan: f.urutan },
          select: { id: true },
        });
        return [f.tempKey, row.id] as const;
      }),
    );
    createdIds = new Map(created);
    await Promise.all(
      update.map((f) =>
        tx.folderDokumenDesaAntiKorupsi.update({ where: { id: f.id }, data: { nama: f.nama, urutan: f.urutan } }),
      ),
    );
    if (remove.length > 0) {
      await tx.dokumenDesaAntiKorupsi.updateMany({
        where: { desaAntiKorupsiId: programId, folderId: { in: remove } },
        data: { folderId: null },
      });
      await tx.folderDokumenDesaAntiKorupsi.updateMany({
        where: { desaAntiKorupsiId: programId, id: { in: remove } },
        data: { isActive: false, deletedAt: now },
      });
    }
  }

  if (plan.dokumen) {
    const { create, update, remove } = plan.dokumen;
    if (remove.length > 0) {
      await tx.dokumenDesaAntiKorupsi.updateMany({
        where: { desaAntiKorupsiId: programId, id: { in: remove } },
        data: { isActive: false, deletedAt: now },
      });
    }
    await Promise.all(
      update.map((d) =>
        tx.dokumenDesaAntiKorupsi.update({
          where: { id: d.id },
          data: { judul: d.judul, urutan: d.urutan, folderId: resolveFolderId(d.folder, createdIds) },
        }),
      ),
    );
    if (create.length > 0) {
      await tx.dokumenDesaAntiKorupsi.createMany({
        data: create.map((d) => ({
          desaAntiKorupsiId: programId,
          fileId: d.fileId,
          judul: d.judul,
          urutan: d.urutan,
          folderId: resolveFolderId(d.folder, createdIds),
        })),
      });
    }
  }
}
