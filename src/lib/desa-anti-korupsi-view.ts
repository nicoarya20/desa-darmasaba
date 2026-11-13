// Bentuk respons API program Desa Anti Korupsi: include Prisma + pembentuk respons (murni).
// Daftar program (findMany) hanya membawa ringkasan jumlah; detail (/:id) membawa isi folder.
import type { Prisma } from "@prisma/client";
import type { DokumenDesaAntiKorupsiView } from "./desa-anti-korupsi-dokumen";
import { FOLDER_UMUM_KEY, FOLDER_UMUM_LABEL } from "./desa-anti-korupsi-folder";
import { groupDokumenPerFolder } from "./dokumen-folder-view";

/** Include daftar program: kategori + jumlah folder & dokumen aktif (satu query, tanpa N+1). */
export const DESA_ANTI_KORUPSI_RINGKAS_INCLUDE = {
  kategori: true,
  _count: {
    select: {
      folders: { where: { isActive: true } },
      dokumen: { where: { isActive: true } },
    },
  },
} satisfies Prisma.DesaAntiKorupsiInclude;

/** Include detail program: kategori + folder aktif + dokumen aktif (urut `urutan`, lalu `createdAt`). */
export const DESA_ANTI_KORUPSI_DETAIL_INCLUDE = {
  kategori: true,
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
} satisfies Prisma.DesaAntiKorupsiInclude;

type RingkasRow = Prisma.DesaAntiKorupsiGetPayload<{ include: typeof DESA_ANTI_KORUPSI_RINGKAS_INCLUDE }>;
type DetailRow = Prisma.DesaAntiKorupsiGetPayload<{ include: typeof DESA_ANTI_KORUPSI_DETAIL_INCLUDE }>;

/** Item daftar program: data program + kategori + ringkasan isi (tanpa daftar dokumen). */
export type DesaAntiKorupsiRingkas = Omit<RingkasRow, "_count"> & { jumlahFolder: number; jumlahDokumen: number };

/** Satu folder di detail program beserta dokumennya. */
export type FolderDokumenView = { id: string; nama: string; urutan: number; dokumen: DokumenDesaAntiKorupsiView[] };

/** Detail program: folder berurutan + dokumen tanpa folder (`dokumenUmum`, folder virtual "Umum"). */
export type DesaAntiKorupsiDetail = Omit<DetailRow, "folders" | "dokumen"> & {
  folders: FolderDokumenView[];
  dokumenUmum: DokumenDesaAntiKorupsiView[];
};

/** Ubah baris findMany (dengan `_count`) menjadi item ringkas `jumlahFolder` / `jumlahDokumen`. */
export function toProgramRingkas(row: RingkasRow): DesaAntiKorupsiRingkas {
  const { _count, ...program } = row;
  return { ...program, jumlahFolder: _count.folders, jumlahDokumen: _count.dokumen };
}

/** Kelompokkan dokumen detail per folder; dokumen tanpa folder aktif masuk `dokumenUmum`. */
export function toProgramDetail(row: DetailRow): DesaAntiKorupsiDetail {
  const { folders, dokumen, ...program } = row;
  return { ...program, ...groupDokumenPerFolder(folders, dokumen) };
}

/** Satu kelompok tampilan: folder nyata (key = id folder) atau folder virtual "Umum" (key = "umum"). */
export type FolderGroupView = { key: string; nama: string; dokumen: DokumenDesaAntiKorupsiView[] };

/** Folder berurutan + "Umum" di akhir (hanya bila ada dokumen tanpa folder) untuk halaman publik & admin. */
export function folderGroups(detail: Pick<DesaAntiKorupsiDetail, "folders" | "dokumenUmum">): FolderGroupView[] {
  const groups: FolderGroupView[] = detail.folders.map((f) => ({ key: f.id, nama: f.nama, dokumen: f.dokumen }));
  if (detail.dokumenUmum.length > 0) {
    groups.push({ key: FOLDER_UMUM_KEY, nama: FOLDER_UMUM_LABEL, dokumen: detail.dokumenUmum });
  }
  return groups;
}
