// Detail admin Desa Anti Korupsi: cari + urut tampilan dokumen per folder dan label tempat sampah.
// Fungsi murni — hanya mengatur tampilan, tidak mengubah urutan tersimpan.
import { filterDokumen, sortDokumen, type DokumenSortKey, type SortDir } from '@/lib/desa-anti-korupsi-sort';
import { FOLDER_UMUM_LABEL } from '@/lib/desa-anti-korupsi-folder';
import type { FolderGroupView } from '@/lib/desa-anti-korupsi-view';

/** Pilihan urutan tampilan di detail admin (nilai Select → kunci & arah `sortDokumen`). */
export const DETAIL_SORT_OPTIONS = [
  { value: 'urutan', label: 'Urutan asli', key: 'urutan', dir: 'asc' },
  { value: 'judul-asc', label: 'Judul A–Z', key: 'judul', dir: 'asc' },
  { value: 'judul-desc', label: 'Judul Z–A', key: 'judul', dir: 'desc' },
  { value: 'tanggal-desc', label: 'Terbaru', key: 'tanggal', dir: 'desc' },
  { value: 'tanggal-asc', label: 'Terlama', key: 'tanggal', dir: 'asc' },
  { value: 'tipe-asc', label: 'Tipe', key: 'tipe', dir: 'asc' },
  { value: 'ukuran-desc', label: 'Ukuran terbesar', key: 'ukuran', dir: 'desc' },
  { value: 'ukuran-asc', label: 'Ukuran terkecil', key: 'ukuran', dir: 'asc' },
] as const satisfies readonly { value: string; label: string; key: DokumenSortKey; dir: SortDir }[];

export type DetailSortValue = (typeof DETAIL_SORT_OPTIONS)[number]['value'];

export const DETAIL_SORT_DEFAULT: DetailSortValue = 'urutan';

/** Nilai Select yang tidak dikenal (mis. null saat dikosongkan) kembali ke "Urutan asli". */
export function toDetailSortValue(raw: string | null): DetailSortValue {
  return DETAIL_SORT_OPTIONS.find((o) => o.value === raw)?.value ?? DETAIL_SORT_DEFAULT;
}

export type DetailGroupsResult = { groups: FolderGroupView[]; total: number; searching: boolean };

/**
 * Saring (judul/nama berkas) lalu urutkan dokumen tiap folder. Saat mencari, folder tanpa hasil
 * disembunyikan; tanpa kata kunci semua folder tetap tampil (termasuk yang kosong).
 */
export function detailGroups(
  groups: readonly FolderGroupView[],
  query: string,
  sort: DetailSortValue,
): DetailGroupsResult {
  const { key, dir } = DETAIL_SORT_OPTIONS.find((o) => o.value === sort) ?? DETAIL_SORT_OPTIONS[0];
  const searching = query.trim() !== '';
  const shown = groups
    .map((g) => ({ ...g, dokumen: sortDokumen(filterDokumen(g.dokumen, query), key, dir) }))
    .filter((g) => !searching || g.dokumen.length > 0);
  return { groups: shown, total: shown.reduce((n, g) => n + g.dokumen.length, 0), searching };
}

const tanggalId = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/** Tanggal ringkas id-ID ("9 Nov 2026"); "—" bila kosong/tidak valid. */
export function formatTanggalId(iso: string | null | undefined): string {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? '—' : tanggalId.format(time);
}

/** Label sisa masa simpan dokumen di tempat sampah. */
export function labelSisaHari(sisaHari: number): string {
  return sisaHari <= 0 ? 'dihapus permanen hari ini' : `dihapus permanen dalam ${sisaHari} hari`;
}

type FolderAktif = readonly { id: string; nama: string }[];

/** Asal dokumen sampah: "Umum", nama folder aktif, atau penanda folder sudah dihapus. */
export function labelFolderAsal(
  item: { folderId: string | null; folderNama: string | null },
  folders: FolderAktif,
): string {
  if (item.folderId === null) return FOLDER_UMUM_LABEL;
  const aktif = folders.find((f) => f.id === item.folderId);
  if (aktif) return aktif.nama;
  return item.folderNama ? `${item.folderNama} (folder sudah dihapus)` : 'folder sudah dihapus';
}

/** Pesan sukses pulihkan, menyebut folder tujuan (backend memulihkan ke folder asal atau "Umum"). */
export function pesanPulihkan(folderId: string | null, folders: FolderAktif): string {
  const nama = folderId === null ? null : folders.find((f) => f.id === folderId)?.nama;
  return nama ? `Dokumen dipulihkan ke folder "${nama}"` : `Dokumen dipulihkan ke folder "${FOLDER_UMUM_LABEL}"`;
}
