import minio, { MINIO_BUCKET } from "@/lib/minio";
import prisma from "@/lib/prisma";
import { moveFileToSampah } from "./fileStorage/_lib/removeStoredFile";

/**
 * DELETE /api/img/:name (admin). Gambar yang tercatat di FileStorage dipindah ke Sampah (asal tidak diketahui
 * → "Lainnya"). Objek lama yang tidak punya baris FileStorage tidak bisa masuk Sampah dan tetap dihapus
 * langsung dari MinIO — dicatat sebagai hutang di docs/debt/2026-11-12-sampah-penghapusan-belum-dialihkan.md.
 */
async function imgDel({ name }: { name: string }) {
  try {
    const file = await prisma.fileStorage.findUnique({ where: { name }, select: { id: true } });
    if (file) {
      const result = await moveFileToSampah(file.id, null);
      return result === "trashed" ? "ok" : "error";
    }
    await minio.removeObject(MINIO_BUCKET, `image/${name}`);
    return "ok";
  } catch (error) {
    console.error(`[imgDel] Gagal menghapus gambar ${name}:`, error);
    return "error";
  }
}

export default imgDel;
