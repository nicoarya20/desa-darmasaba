// Penulisan rencana sinkron folder + dokumen (hasil planProgramSync) yang dipakai bersama oleh
// Desa Anti Korupsi dan APBDes. Tabel tiap domain berbeda, jadi akses DB lewat `IsiSyncStore`
// yang dibuat per domain di dalam transaksi; urutan langkahnya dijaga di satu tempat.
import { resolveFolderId } from "./desa-anti-korupsi-folder";
import type { ProgramSyncPlan } from "./desa-anti-korupsi-sync";

/** Data dokumen yang ditulis ke DB (folderId null = folder virtual "Umum"). */
export type DokumenTulis = { judul: string; urutan: number; folderId: string | null };

/** Operasi tulis folder & dokumen milik SATU pemilik (program DAK / APBDes); semua sudah ter-scope pemilik. */
export type IsiSyncStore = {
  createFolder(data: { nama: string; urutan: number }): Promise<{ id: string }>;
  updateFolder(id: string, data: { nama: string; urutan: number }): Promise<unknown>;
  /** Lepas dokumen (aktif maupun tidak) dari folder-folder ini ke "Umum". */
  releaseFolderDokumen(folderIds: string[]): Promise<unknown>;
  softDeleteFolders(folderIds: string[], now: Date): Promise<unknown>;
  softDeleteDokumen(ids: string[], now: Date): Promise<unknown>;
  updateDokumen(id: string, data: DokumenTulis): Promise<unknown>;
  createDokumen(rows: (DokumenTulis & { fileId: string })[]): Promise<unknown>;
};

/**
 * Tulis rencana sinkron lewat `store`. Urutan penting: folder baru dibuat dulu (tempKey → id),
 * folder yang dihapus melepas dokumennya ke "Umum" sebelum di-soft-delete, baru dokumen disinkronkan
 * (dokumen yang dipindah keluar dari folder terhapus tetap mendapat folder tujuannya).
 */
export async function applyIsiSync(store: IsiSyncStore, plan: ProgramSyncPlan): Promise<void> {
  const now = new Date();
  let createdIds = new Map<string, string>();

  if (plan.folders) {
    const { create, update, remove } = plan.folders;
    const created = await Promise.all(
      create.map(async (f) => {
        const row = await store.createFolder({ nama: f.nama, urutan: f.urutan });
        return [f.tempKey, row.id] as const;
      }),
    );
    createdIds = new Map(created);
    await Promise.all(update.map((f) => store.updateFolder(f.id, { nama: f.nama, urutan: f.urutan })));
    if (remove.length > 0) {
      await store.releaseFolderDokumen(remove);
      await store.softDeleteFolders(remove, now);
    }
  }

  if (plan.dokumen) {
    const { create, update, remove } = plan.dokumen;
    if (remove.length > 0) await store.softDeleteDokumen(remove, now);
    await Promise.all(
      update.map((d) =>
        store.updateDokumen(d.id, { judul: d.judul, urutan: d.urutan, folderId: resolveFolderId(d.folder, createdIds) }),
      ),
    );
    if (create.length > 0) {
      await store.createDokumen(
        create.map((d) => ({
          fileId: d.fileId,
          judul: d.judul,
          urutan: d.urutan,
          folderId: resolveFolderId(d.folder, createdIds),
        })),
      );
    }
  }
}
