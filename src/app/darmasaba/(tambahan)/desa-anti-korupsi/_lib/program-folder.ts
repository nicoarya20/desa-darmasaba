// Logika murni halaman program publik Desa Anti Korupsi: URL program/folder, ringkasan isi,
// folder aktif dari ?folder, dan pencarian judul dokumen lintas folder.
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';

const PROGRAM_PATH = '/darmasaba/desa-anti-korupsi/program';

/** URL halaman program; `folderKey` (id folder atau "umum") membuka folder tersebut. */
export function programHref(id: string, folderKey?: string | null): string {
  const base = `${PROGRAM_PATH}/${encodeURIComponent(id)}`;
  return folderKey ? `${base}?folder=${encodeURIComponent(folderKey)}` : base;
}

/** Ringkasan isi kartu program: "N folder · M dokumen"; bagian folder disembunyikan bila 0. */
export function ringkasanIsi(jumlahFolder: number, jumlahDokumen: number): string {
  const dokumen = `${jumlahDokumen} dokumen`;
  return jumlahFolder > 0 ? `${jumlahFolder} folder · ${dokumen}` : dokumen;
}

/** Folder aktif dari query `?folder=`; tidak ada / tidak dikenal → null (tampilkan grid folder). */
export function resolveActiveFolder(
  param: string | null | undefined,
  groups: readonly FolderGroupView[],
): FolderGroupView | null {
  if (!param) return null;
  return groups.find((g) => g.key === param) ?? null;
}

/** Hasil cari: dokumen beserta folder asalnya. */
export type DokumenHasilCari = { folder: FolderGroupView; dokumen: DokumenDesaAntiKorupsiView };

/** Cari judul dokumen di semua folder (abaikan kapital & spasi tepi); kata kunci kosong → []. */
export function searchDokumen(groups: readonly FolderGroupView[], query: string): DokumenHasilCari[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return groups.flatMap((folder) =>
    folder.dokumen.filter((d) => d.judul.toLowerCase().includes(q)).map((dokumen) => ({ folder, dokumen })),
  );
}
