import { MAX_GAMBAR_SISIPAN, namaGambarSisipan } from "@/lib/gambar-sisipan";
import prisma from "@/lib/prisma";

type HasilSisipan = { ok: true; ids: string[] } | { ok: false; message: string };

/**
 * ID FileStorage gambar yang disisipkan di deskripsi (`<img src="/api/img/<nama>">`). Src lain dan nama yang tidak
 * terdaftar diabaikan (tidak tampil di publik karena disaring `sanitizeArticleHtml`). Melebihi batas → ditolak.
 */
export async function idGambarSisipan(description: string): Promise<HasilSisipan> {
  const nama = namaGambarSisipan(description);
  if (nama.length > MAX_GAMBAR_SISIPAN) {
    return {
      ok: false,
      message: `Maksimal ${MAX_GAMBAR_SISIPAN} gambar di dalam deskripsi (dikirim ${nama.length})`,
    };
  }
  if (nama.length === 0) return { ok: true, ids: [] };
  const files = await prisma.fileStorage.findMany({
    where: { name: { in: nama }, category: "image" },
    select: { id: true },
  });
  return { ok: true, ids: files.map((file) => file.id) };
}
