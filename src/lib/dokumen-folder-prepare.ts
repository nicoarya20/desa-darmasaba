// Validasi payload isi folder dokumen (folder + dokumen) terhadap isi tersimpan + cek berkas baru —
// dipakai bersama endpoint Desa Anti Korupsi dan APBDes sebelum menulis di transaksi.
import prisma from "@/lib/prisma";
import {
  planProgramSync,
  type ProgramIsiInput,
  type ProgramIsiTersimpan,
  type ProgramSyncResult,
} from "./desa-anti-korupsi-sync";

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

/**
 * Hitung rencana sinkron: `folders` & `dokumen` tidak dikirim → rencana kosong (tidak memuat DB);
 * selain itu validasi terhadap isi tersimpan (`load`), lalu cek berkas dokumen baru.
 */
export async function prepareIsiSync(
  load: () => Promise<ProgramIsiTersimpan>,
  input: ProgramIsiInput,
): Promise<ProgramSyncResult> {
  if (input.folders === undefined && input.dokumen === undefined) {
    return { ok: true, plan: { folders: null, dokumen: null } };
  }
  const planned = planProgramSync(await load(), input);
  if (!planned.ok) return planned;

  const fileError = await checkDokumenFiles(planned.plan.dokumen?.create.map((d) => d.fileId) ?? []);
  if (fileError) return { ok: false, message: fileError };

  return planned;
}
