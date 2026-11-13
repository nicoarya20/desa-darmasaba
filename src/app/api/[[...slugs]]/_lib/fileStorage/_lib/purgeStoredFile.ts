import minio, { MINIO_BUCKET } from "@/lib/minio";
import prisma from "@/lib/prisma";
import { isFileReferenced } from "./fileReferences";

/** Hasil hapus permanen satu berkas. */
export type PurgeStoredFileResult = "deleted" | "referenced" | "missing";

/**
 * Hapus permanen berkas: baris FileStorage dulu, lalu objek MinIO. Berkas yang masih dirujuk data lain tidak
 * disentuh ("referenced") — pola bug Maskot: jangan pernah hapus berkas sebelum relasinya. Objek MinIO yang
 * gagal dihapus dicatat (berkas yatim di storage tidak merusak link karena barisnya sudah tidak ada).
 */
export async function purgeStoredFile(fileId: string): Promise<PurgeStoredFileResult> {
  if (await isFileReferenced(fileId)) return "referenced";
  const file = await prisma.fileStorage.findUnique({ where: { id: fileId }, select: { path: true, name: true } });
  if (!file) return "missing";

  await prisma.fileStorage.delete({ where: { id: fileId } });
  try {
    await minio.removeObject(MINIO_BUCKET, `${file.path}/${file.name}`);
  } catch (error) {
    console.error(`[purgeStoredFile] Gagal hapus objek MinIO file ${fileId}:`, error);
  }
  return "deleted";
}
