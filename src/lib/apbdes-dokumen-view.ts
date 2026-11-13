// Bentuk respons dokumen APBDes: include Prisma (folder & dokumen aktif, terurut) + pembentuk respons
// `{ folders: [{ ..., dokumen }], dokumenUmum }` — bentuk sama dengan detail Desa Anti Korupsi supaya
// editor admin bersama (isiDraftFromDetail) bisa langsung memakainya.
import type { Prisma } from "@prisma/client";
import { groupDokumenPerFolder, type IsiFolderTampil } from "./dokumen-folder-view";

/** Include folder aktif + dokumen aktif APBDes (urut `urutan`, lalu `createdAt`). */
export const APBDES_DOKUMEN_INCLUDE = {
  folders: {
    where: { isActive: true },
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    select: { id: true, nama: true, urutan: true },
  },
  dokumen: {
    where: { isActive: true },
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      judul: true,
      urutan: true,
      fileId: true,
      folderId: true,
      createdAt: true,
      file: { select: { id: true, link: true, realName: true, mimeType: true, size: true } },
    },
  },
} satisfies Prisma.APBDesInclude;

type IsiRow = Prisma.APBDesGetPayload<{ include: typeof APBDES_DOKUMEN_INCLUDE }>;
type FolderRow = IsiRow["folders"][number];
type DokumenRow = IsiRow["dokumen"][number];

/** Isi dokumen APBDes di respons API. */
export type ApbdesIsiTampil = IsiFolderTampil<FolderRow, DokumenRow>;

/** Ganti relasi mentah `folders`/`dokumen` baris APBDes dengan folder berisi dokumen + `dokumenUmum`. */
export function toApbdesDokumenView<T extends Pick<IsiRow, "folders" | "dokumen">>(
  row: T,
): Omit<T, "folders" | "dokumen"> & ApbdesIsiTampil {
  const { folders, dokumen, ...rest } = row;
  return { ...rest, ...groupDokumenPerFolder(folders, dokumen) };
}
