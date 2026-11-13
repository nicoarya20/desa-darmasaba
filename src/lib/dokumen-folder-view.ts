// Pembentuk respons isi folder dokumen (murni) yang dipakai bersama oleh Desa Anti Korupsi dan APBDes:
// baris folder + baris dokumen (ber-folderId) → folder berisi dokumennya + dokumen "Umum".

type FolderRow = { id: string };
type DokumenRow = { folderId: string | null; createdAt: Date };

/** Dokumen di respons API: tanpa `folderId`, `createdAt` berupa ISO string. */
export type DokumenTampil<D extends DokumenRow> = Omit<D, "folderId" | "createdAt"> & { createdAt: string };

/** Hasil pengelompokan: urutan folder & dokumen mengikuti urutan input. */
export type IsiFolderTampil<F extends FolderRow, D extends DokumenRow> = {
  folders: (F & { dokumen: DokumenTampil<D>[] })[];
  dokumenUmum: DokumenTampil<D>[];
};

/** Kelompokkan dokumen per folder; dokumen tanpa folder (atau foldernya tidak ada di daftar) masuk `dokumenUmum`. */
export function groupDokumenPerFolder<F extends FolderRow, D extends DokumenRow>(
  folders: readonly F[],
  dokumen: readonly D[],
): IsiFolderTampil<F, D> {
  const byFolder = new Map<string, DokumenTampil<D>[]>(folders.map((f) => [f.id, []]));
  const dokumenUmum: DokumenTampil<D>[] = [];

  for (const { folderId, createdAt, ...item } of dokumen) {
    const bucket = folderId ? byFolder.get(folderId) : undefined;
    (bucket ?? dokumenUmum).push({ ...item, createdAt: createdAt.toISOString() } as DokumenTampil<D>);
  }

  return { folders: folders.map((f) => ({ ...f, dokumen: byFolder.get(f.id) ?? [] })), dokumenUmum };
}
