import prisma from "@/lib/prisma";

export const PDF_MIME_TYPE = "application/pdf";

/** Pastikan fileId menunjuk berkas PDF aktif di FileStorage; kembalikan pesan error atau null. */
export async function checkPdfFile(fileId: string | null | undefined): Promise<string | null> {
  if (!fileId) return null;
  const file = await prisma.fileStorage.findUnique({
    where: { id: fileId },
    select: { mimeType: true, isActive: true },
  });
  if (!file || !file.isActive) return "File tidak ditemukan atau sudah dihapus";
  if (file.mimeType !== PDF_MIME_TYPE) return "File dokumen harus berformat PDF";
  return null;
}

/** Relasi file yang ikut dikembalikan di semua respons dokumen. */
export const FILE_SELECT = {
  select: { id: true, link: true, realName: true },
} as const;
