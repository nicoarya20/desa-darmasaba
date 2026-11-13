import { purgeStoredFile } from "./purgeStoredFile";

/** Data FileStorage minimal yang dibutuhkan untuk menghapus berkas permanen. */
export type StoredFileRef = { id: string };

/**
 * Hapus permanen berkas milik `owner` (nama model Prisma, hanya untuk konteks log): baris FileStorage dulu, lalu
 * objek MinIO (`purgeStoredFile`). Dipanggil SETELAH operasi DB utama berhasil. Berkas yang masih dirujuk data lain
 * dibiarkan. Tidak melempar: kegagalan dicatat dengan konteks (`owner` + id file) agar operasi utama tetap sukses;
 * berkas yang gagal dihapus tetap utuh (tidak ada link yang rusak).
 */
export default async function removeStoredFile(file: StoredFileRef, owner: string): Promise<void> {
  try {
    const result = await purgeStoredFile(file.id);
    if (result === "referenced") {
      console.info(`[removeStoredFile] FileStorage ${file.id} (${owner}) masih dirujuk data lain; tidak dihapus`);
    }
  } catch (error) {
    console.error(`[removeStoredFile] Gagal hapus permanen FileStorage ${file.id} (${owner}):`, error);
  }
}
