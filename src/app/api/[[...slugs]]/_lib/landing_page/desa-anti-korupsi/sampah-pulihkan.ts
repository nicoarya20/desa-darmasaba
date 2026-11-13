import prisma from "@/lib/prisma";
import { resolveRetensiHari, sampahCutoff } from "@/lib/desa-anti-korupsi-sampah";
import { pulihkanDokumenFolder, type PulihkanDokumenResult } from "@/lib/dokumen-folder-pulihkan";

/** Retensi tempat sampah DAK (env `DAK_SAMPAH_RETENSI_HARI`, default = retensi Sampah global). */
export const dakRetensiHari = () => resolveRetensiHari(process.env.DAK_SAMPAH_RETENSI_HARI);

/**
 * Pulihkan dokumen DAK dari sampah dalam satu transaksi (panel sampah DAK; aturan folder yang sama dipakai
 * Sampah APBDes).
 */
export function pulihkanDokumenDak(id: string, now: Date = new Date()): Promise<PulihkanDokumenResult> {
  const cutoff = sampahCutoff(now, dakRetensiHari());
  return prisma.$transaction((tx) =>
    pulihkanDokumenFolder(
      {
        async findSampah(dokumenId, batas) {
          const doc = await tx.dokumenDesaAntiKorupsi.findFirst({
            where: { id: dokumenId, isActive: false, deletedAt: { gt: batas } },
            select: {
              id: true,
              desaAntiKorupsiId: true,
              fileId: true,
              folderId: true,
              folder: { select: { isActive: true } },
              file: { select: { isActive: true } },
            },
          });
          if (!doc) return null;
          return {
            id: doc.id,
            scopeId: doc.desaAntiKorupsiId,
            fileId: doc.fileId,
            folderId: doc.folderId,
            folderAktif: doc.folder?.isActive === true,
            fileAktif: doc.file.isActive,
          };
        },
        findAktif: (programId) =>
          tx.dokumenDesaAntiKorupsi.findMany({
            where: { desaAntiKorupsiId: programId, isActive: true },
            select: { folderId: true, fileId: true, urutan: true },
          }),
        restore: (dokumenId, data) =>
          tx.dokumenDesaAntiKorupsi.update({ where: { id: dokumenId }, data: { isActive: true, deletedAt: null, ...data } }),
      },
      id,
      cutoff,
    ),
  );
}
