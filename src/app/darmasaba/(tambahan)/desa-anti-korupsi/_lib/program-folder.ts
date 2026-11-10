// Logika murni halaman program publik Desa Anti Korupsi: URL program/folder, ringkasan isi,
// folder aktif dari ?folder, pencarian dokumen lintas folder, dan total ukuran folder.
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { filterDokumen } from '@/lib/desa-anti-korupsi-sort';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { serializeUrut, type UrutValue } from './program-urut';

const PROGRAM_PATH = '/darmasaba/desa-anti-korupsi/program';

/** URL halaman program; `folderKey` (id folder atau "umum") membuka folder, `urut` non-default ikut dibagikan. */
export function programHref(id: string, folderKey?: string | null, urut?: UrutValue): string {
  const base = `${PROGRAM_PATH}/${encodeURIComponent(id)}`;
  const query = new URLSearchParams();
  if (folderKey) query.set('folder', folderKey);
  const urutQuery = urut ? serializeUrut(urut) : null;
  if (urutQuery) query.set('urut', urutQuery);
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
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

/** Cari judul / nama berkas dokumen di semua folder (aturan sama dengan admin); kata kunci kosong → []. */
export function searchDokumen(groups: readonly FolderGroupView[], query: string): DokumenHasilCari[] {
  if (!query.trim()) return [];
  return groups.flatMap((folder) => filterDokumen(folder.dokumen, query).map((dokumen) => ({ folder, dokumen })));
}

/** Total ukuran (byte) dokumen folder; null bila folder kosong atau ada berkas yang ukurannya belum diketahui. */
export function totalUkuranFolder(dokumen: readonly DokumenDesaAntiKorupsiView[]): number | null {
  if (dokumen.length === 0) return null;
  let total = 0;
  for (const d of dokumen) {
    if (d.file.size == null) return null;
    total += d.file.size;
  }
  return total;
}
