import prisma from "@/lib/prisma";
import { pulihkanDokumenFolder, type PulihkanDokumenResult } from "@/lib/dokumen-folder-pulihkan";

/**
 * Pulihkan dokumen APBDes dari Sampah (aturan sama dengan DAK: folder asal bila aktif, selain itu "Umum",
 * di akhir folder; bentrok berkas/batas 50 → 409) dalam satu transaksi.
 */
export function pulihkanDokumenApbdes(id: string, cutoff: Date): Promise<PulihkanDokumenResult> {
  return prisma.$transaction((tx) =>
    pulihkanDokumenFolder(
      {
        async findSampah(dokumenId, batas) {
          const doc = await tx.dokumenAPBDes.findFirst({
            where: { id: dokumenId, isActive: false, deletedAt: { gt: batas } },
            select: {
              id: true,
              apbdesId: true,
              fileId: true,
              folderId: true,
              folder: { select: { isActive: true } },
              file: { select: { isActive: true } },
            },
          });
          if (!doc) return null;
          return {
            id: doc.id,
            scopeId: doc.apbdesId,
            fileId: doc.fileId,
            folderId: doc.folderId,
            folderAktif: doc.folder?.isActive === true,
            fileAktif: doc.file.isActive,
          };
        },
        findAktif: (apbdesId) =>
          tx.dokumenAPBDes.findMany({
            where: { apbdesId, isActive: true },
            select: { folderId: true, fileId: true, urutan: true },
          }),
        restore: (dokumenId, data) =>
          tx.dokumenAPBDes.update({ where: { id: dokumenId }, data: { isActive: true, deletedAt: null, ...data } }),
      },
      id,
      cutoff,
    ),
  );
}
