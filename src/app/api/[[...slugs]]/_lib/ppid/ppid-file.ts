import prisma from "@/lib/prisma";
import type { Context } from "elysia";

/** Kolom FileStorage yang dikirim ke klien untuk berkas PPID (cukup untuk tautan unduh; tanpa path internal). */
export const PPID_FILE_SELECT = { id: true, link: true, realName: true } as const;

/** Pesan galat saat `fileId` kiriman tidak merujuk berkas di FileStorage. */
export const PESAN_FILE_PPID_TIDAK_ADA = "Berkas tidak ditemukan di penyimpanan";

/**
 * Tolak `fileId` yang tidak ada di FileStorage (status 400). Mengembalikan body galat, atau null bila `fileId`
 * kosong (tidak mengubah berkas) atau valid. Dipakai Dasar Hukum dan Daftar Informasi Publik.
 */
export async function rejectUnknownPpidFile(
  set: Context["set"],
  fileId: string | null | undefined,
): Promise<{ success: false; message: string } | null> {
  if (!fileId) return null;
  const file = await prisma.fileStorage.findUnique({ where: { id: fileId }, select: { id: true } });
  if (file) return null;
  set.status = 400;
  return { success: false, message: PESAN_FILE_PPID_TIDAK_ADA };
}
