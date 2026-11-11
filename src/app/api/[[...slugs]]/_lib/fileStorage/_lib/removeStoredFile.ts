import minio, { MINIO_BUCKET } from "@/lib/minio";
import prisma from "@/lib/prisma";

/** Data FileStorage minimal yang dibutuhkan untuk menghapus baris + objek MinIO-nya. */
export type StoredFileRef = { id: string; path: string; name: string };

/**
 * Hapus baris FileStorage lalu objek MinIO-nya. Dipanggil SETELAH operasi DB utama berhasil.
 * Tidak melempar: kegagalan dicatat dengan konteks (`owner` + id file) agar operasi utama
 * tetap sukses; sisa file yatim bisa dibersihkan belakangan.
 * Baris DB dihapus dulu: bila gagal (mis. masih direferensikan data lain), objek MinIO
 * dibiarkan agar link yang masih dipakai tidak rusak.
 */
export default async function removeStoredFile(file: StoredFileRef, owner: string): Promise<void> {
  try {
    await prisma.fileStorage.delete({ where: { id: file.id } });
  } catch (error) {
    console.error(`[removeStoredFile] Gagal hapus FileStorage ${file.id} (${owner}):`, error);
    return;
  }

  try {
    await minio.removeObject(MINIO_BUCKET, `${file.path}/${file.name}`);
  } catch (error) {
    console.error(`[removeStoredFile] Gagal hapus objek MinIO file ${file.id} (${owner}):`, error);
  }
}
