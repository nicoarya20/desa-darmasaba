import minio, { MINIO_BUCKET } from "@/lib/minio";
import prisma from "@/lib/prisma";
import { purgeStoredFile } from "./fileStorage/_lib/purgeStoredFile";

/**
 * DELETE /api/img/:name (admin): hapus permanen gambar. Gambar yang tercatat di FileStorage lewat `purgeStoredFile`
 * (baris dulu, lalu MinIO; ditolak bila masih dirujuk data lain); objek lama tanpa baris FileStorage dihapus langsung
 * dari MinIO.
 */
async function imgDel({ name }: { name: string }) {
  try {
    const file = await prisma.fileStorage.findUnique({ where: { name }, select: { id: true } });
    if (file) return (await purgeStoredFile(file.id)) === "deleted" ? "ok" : "error";
    await minio.removeObject(MINIO_BUCKET, `image/${name}`);
    return "ok";
  } catch (error) {
    console.error(`[imgDel] Gagal menghapus gambar ${name}:`, error);
    return "error";
  }
}

export default imgDel;
