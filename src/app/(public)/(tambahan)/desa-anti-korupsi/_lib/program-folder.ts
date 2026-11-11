// Logika murni halaman program publik Desa Anti Korupsi: URL program/folder, ringkasan isi,
// folder aktif dari ?folder, pencarian dokumen lintas folder, dan total ukuran folder.
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { filterDokumen } from '@/lib/desa-anti-korupsi-sort';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';
import { detailHref } from './kategori-tab';
import { serializeUrut, type UrutValue } from './program-urut';

const PROGRAM_PATH = '/desa-anti-korupsi/program';

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

/**
 * Folder yang langsung dibuka saat halaman program tanpa `?folder=`: satu-satunya folder berisi dokumen.
 * Folder kosong tidak dihitung; ≥2 folder berisi atau tidak ada dokumen → null (tampilkan daftar folder).
 */
export function folderTunggalBerisi(groups: readonly FolderGroupView[]): FolderGroupView | null {
  const berisi = groups.filter((g) => g.dokumen.length > 0);
  return berisi.length === 1 ? berisi[0] : null;
}

const DAK_ROOT_HREF = '/desa-anti-korupsi';

/** Tujuan tombol Kembali halaman program: URL + nama aksesibel yang menyebut tujuannya. */
export type TujuanKembali = { href: string; label: string };

/**
 * Tujuan tombol Kembali halaman program (bukan `history.back`, agar hasilnya pasti):
 * folder dibuka lewat `?folder=` → daftar folder program; selain itu → tab kategori halaman detail.
 */
export function tujuanKembali(opts: {
  programId: string;
  kategori: string | null;
  folderDibuka: boolean;
  urut?: UrutValue;
}): TujuanKembali {
  if (opts.folderDibuka) {
    return { href: programHref(opts.programId, null, opts.urut), label: 'Kembali ke daftar folder' };
  }
  if (opts.kategori) return { href: detailHref(opts.kategori), label: 'Kembali ke daftar indikator' };
  return { href: DAK_ROOT_HREF, label: 'Kembali ke Desa Anti Korupsi' };
}
