import prisma from "@/lib/prisma";
import { menuIdForOwner } from "@/lib/sampah/sampah-file-owner";
import { isFileReferenced } from "./fileReferences";

/** Data FileStorage minimal yang dibutuhkan untuk memindahkan berkas ke Sampah. */
export type StoredFileRef = { id: string };

/** Hasil memindahkan berkas ke Sampah. */
export type MoveToSampahResult = "trashed" | "referenced" | "missing";

/**
 * Pindahkan berkas ke Sampah (soft delete: `deletedAt`, `isActive=false`, `deletedFrom`). Baris & objek MinIO
 * TIDAK dihapus — itu tugas hapus permanen/purge. Berkas yang masih dirujuk data lain dibiarkan aktif
 * ("referenced"); berkas yang tidak ada / sudah di Sampah → "missing".
 */
export async function moveFileToSampah(
  fileId: string,
  deletedFrom: string | null,
  now: Date = new Date(),
): Promise<MoveToSampahResult> {
  if (await isFileReferenced(fileId)) return "referenced";
  const { count } = await prisma.fileStorage.updateMany({
    where: { id: fileId, deletedAt: null },
    data: { deletedAt: now, isActive: false, deletedFrom },
  });
  return count === 0 ? "missing" : "trashed";
}

/**
 * Pindahkan berkas milik `owner` (nama model Prisma, lihat `FILE_OWNER_MENU`) ke Sampah. Dipanggil SETELAH
 * operasi DB utama berhasil. Tidak melempar: kegagalan dicatat dengan konteks (`owner` + id file) agar
 * operasi utama tetap sukses; berkas yang gagal dipindah tetap aktif (tidak ada link yang rusak).
 */
export default async function removeStoredFile(file: StoredFileRef, owner: string): Promise<void> {
  try {
    await moveFileToSampah(file.id, menuIdForOwner(owner));
  } catch (error) {
    console.error(`[removeStoredFile] Gagal memindahkan FileStorage ${file.id} (${owner}) ke Sampah:`, error);
  }
}
