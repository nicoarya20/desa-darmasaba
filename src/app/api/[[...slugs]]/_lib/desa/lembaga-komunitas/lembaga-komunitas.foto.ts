import prisma from "@/lib/prisma";
import type { Context } from "elysia";

/** Kolom FileStorage foto yang dikirim ke klien (id + link `/api/img/...`; tanpa path internal). */
export const LEMBAGA_KOMUNITAS_FOTO_SELECT = { id: true, link: true } as const;

/** Kategori FileStorage yang sah untuk foto lembaga (gambar hasil unggah, disimpan sebagai WebP). */
const KATEGORI_FOTO = "image";

export const PESAN_FOTO_LEMBAGA_TIDAK_ADA = "Foto tidak ditemukan di penyimpanan";
export const PESAN_FOTO_LEMBAGA_BUKAN_GAMBAR = "Berkas foto harus berupa gambar";

/**
 * Tolak `fotoId` yang tidak ada di FileStorage atau bukan gambar (status 400). Mengembalikan body galat, atau null bila
 * `fotoId` kosong (tidak mengubah / melepas foto) atau valid.
 */
export async function rejectInvalidFoto(
  set: Context["set"],
  fotoId: string | null | undefined,
): Promise<{ success: false; message: string } | null> {
  if (!fotoId) return null;
  const file = await prisma.fileStorage.findUnique({ where: { id: fotoId }, select: { id: true, category: true } });
  const message = !file ? PESAN_FOTO_LEMBAGA_TIDAK_ADA : file.category !== KATEGORI_FOTO ? PESAN_FOTO_LEMBAGA_BUKAN_GAMBAR : null;
  if (!message) return null;
  set.status = 400;
  return { success: false, message };
}
