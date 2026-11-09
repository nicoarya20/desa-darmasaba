// Urut & cari di editor admin Desa Anti Korupsi — murni. "Urutkan menurut…" menulis ulang urutan
// dokumen satu folder di draft (tersimpan saat Simpan); pencarian hanya menyaring tampilan.
import { filterDokumen, sortDokumen, type DokumenSortKey, type SortDir } from '@/lib/desa-anti-korupsi-sort';
import { folderLabel, type FolderOutcome } from './dokumen-bulk-actions';
import type { DokumenDraft } from './dokumen-draft';
import { draftTanggal, draftUkuran } from './draft-info';
import type { DraftGroup, IsiDraft } from './folder-draft';

/** Satu pilihan "Urutkan menurut…": `value` unik untuk menu, `key`/`dir` diteruskan ke sortDokumen. */
export type UrutDraftOption = { value: string; label: string; key: DokumenSortKey; dir: SortDir };

/** Pilihan urut isi folder di editor (berurutan sesuai tampilan menu). */
export const URUT_DRAFT_OPTIONS: readonly UrutDraftOption[] = [
  { value: 'judul-asc', label: 'Judul A–Z', key: 'judul', dir: 'asc' },
  { value: 'judul-desc', label: 'Judul Z–A', key: 'judul', dir: 'desc' },
  { value: 'tanggal-desc', label: 'Terbaru', key: 'tanggal', dir: 'desc' },
  { value: 'tanggal-asc', label: 'Terlama', key: 'tanggal', dir: 'asc' },
  { value: 'tipe-asc', label: 'Tipe', key: 'tipe', dir: 'asc' },
  { value: 'ukuran-desc', label: 'Ukuran (terbesar)', key: 'ukuran', dir: 'desc' },
  { value: 'ukuran-asc', label: 'Ukuran (terkecil)', key: 'ukuran', dir: 'asc' },
];

/**
 * Urutkan ulang dokumen satu folder (null = "Umum") di draft; dokumen folder lain tetap di posisinya.
 * Draft belum diunggah: ukuran dari File.size, tanggal = `now`. Urutan tak berubah → `isi` yang sama.
 */
export function sortFolderDrafts(
  isi: IsiDraft,
  folderKey: string | null,
  key: DokumenSortKey,
  dir: SortDir,
  now: Date = new Date(),
): IsiDraft {
  const posisi = isi.dokumen.flatMap((d, i) => (d.folderKey === folderKey ? [i] : []));
  const items = posisi.map((i, urutan) => {
    const draft = isi.dokumen[i];
    return {
      draft,
      judul: draft.judul,
      urutan,
      createdAt: draftTanggal(draft, now),
      file: { mimeType: draft.mimeType, realName: draft.realName, size: draftUkuran(draft) },
    };
  });
  const sorted = sortDokumen(items, key, dir);
  if (sorted.every((item, i) => item.urutan === i)) return isi;
  const dokumen = [...isi.dokumen];
  posisi.forEach((slot, i) => {
    dokumen[slot] = sorted[i].draft;
  });
  return { ...isi, dokumen };
}

/** Aksi menu "Urutkan menurut…" satu folder: isi baru + notifikasi (info bila sudah urut/pilihan tak dikenal). */
export function sortFolderAction(isi: IsiDraft, folderKey: string | null, optionValue: string, now?: Date): FolderOutcome {
  const option = URUT_DRAFT_OPTIONS.find((o) => o.value === optionValue);
  if (!option) return { isi, message: 'Pilihan urutan tidak dikenal', tone: 'error' };
  const label = folderLabel(isi, folderKey);
  const next = sortFolderDrafts(isi, folderKey, option.key, option.dir, now);
  if (next === isi) return { isi, message: `Isi "${label}" sudah urut menurut ${option.label}`, tone: 'info' };
  return { isi: next, message: `Isi "${label}" diurutkan menurut ${option.label}`, tone: 'success' };
}

/**
 * Saring tampilan kelompok dengan kata kunci (judul / nama berkas). Kata kunci kosong → semua kelompok
 * apa adanya; ada kata kunci → hanya kelompok yang punya dokumen cocok. Draft tidak diubah.
 */
export function filterDraftGroups(groups: readonly DraftGroup[], query: string): DraftGroup[] {
  if (query.trim() === '') return [...groups];
  return groups
    .map((g) => {
      const items = g.dokumen.map((draft) => ({ draft, judul: draft.judul, file: { realName: draft.realName } }));
      return { ...g, dokumen: filterDokumen(items, query).map((item) => item.draft) };
    })
    .filter((g) => g.dokumen.length > 0);
}

/** Posisi asli tiap dokumen di foldernya (index 0-based + total) — nomor urut tetap benar saat disaring. */
export function posisiDraft(groups: readonly DraftGroup[]): Map<string, { index: number; total: number }> {
  const map = new Map<string, { index: number; total: number }>();
  for (const g of groups) g.dokumen.forEach((d: DokumenDraft, index) => map.set(d.key, { index, total: g.dokumen.length }));
  return map;
}
