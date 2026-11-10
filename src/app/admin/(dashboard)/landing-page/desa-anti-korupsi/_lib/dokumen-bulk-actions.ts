// Hasil aksi massal di editor admin Desa Anti Korupsi dalam bentuk murni: isi draft baru, seleksi baru,
// dan pesan notifikasi. Handler UI (DokumenBulkActions, FolderManager) tinggal menerapkan + menampilkan toast.
import { FOLDER_UMUM_LABEL } from '@/lib/desa-anti-korupsi-folder';
import {
  copyDrafts,
  copyFolderContents,
  deleteDrafts,
  duplicateFileError,
  duplicateFolder,
  moveDrafts,
  type CopyResult,
} from './dokumen-bulk';
import { isDraftListValid } from './dokumen-draft';
import { emptySelection, type Selection } from './dokumen-selection';
import { isFolderListValid, type DraftGroup, type IsiDraft } from './folder-draft';

/** Nada notifikasi: success = ada perubahan, info = tidak ada yang berubah, error = aksi ditolak. */
export type NoticeTone = 'success' | 'info' | 'error';

/** Pesan untuk admin setelah aksi. */
export type Notice = { message: string; tone: NoticeTone };

/** Hasil aksi massal dokumen: isi baru + seleksi baru (selalu dikosongkan) + notifikasi. */
export type BulkOutcome = Notice & { isi: IsiDraft; selection: Selection };

/** Hasil aksi folder: isi baru + notifikasi. */
export type FolderOutcome = Notice & { isi: IsiDraft };

/** Nama tampilan folder (null = "Umum"; nama kosong = "(tanpa nama)"). */
export function folderLabel(isi: IsiDraft, folderKey: string | null): string {
  if (folderKey === null) return FOLDER_UMUM_LABEL;
  return isi.folders.find((f) => f.key === folderKey)?.nama.trim() || '(tanpa nama)';
}

/** Urutan tampilan semua key dokumen (folder berurutan, "Umum" terakhir) — dasar rentang Shift+klik. */
export function orderedDokumenKeys(groups: readonly DraftGroup[]): string[] {
  return groups.flatMap((g) => g.dokumen.map((d) => d.key));
}

/** Folder yang tidak bisa jadi tujuan: folder asal bila semua dokumen terpilih berada di satu folder. */
export function sharedFolderKeys(isi: IsiDraft, sel: Selection): Array<string | null> {
  const folders = new Set(isi.dokumen.filter((d) => sel.has(d.key)).map((d) => d.folderKey));
  return folders.size === 1 ? [...folders] : [];
}

/** Notifikasi hasil salin: "N dokumen disalin" + ", M dilewati karena sudah ada di folder tujuan" bila ada. */
export function copyNotice({ copied, skipped }: Pick<CopyResult, 'copied' | 'skipped'>): Notice {
  if (copied === 0 && skipped === 0) return { message: 'Tidak ada dokumen untuk disalin', tone: 'info' };
  const lewati = skipped > 0 ? `, ${skipped} dilewati karena sudah ada di folder tujuan` : '';
  return { message: `${copied} dokumen disalin${lewati}`, tone: copied > 0 ? 'success' : 'info' };
}

/** Pindahkan dokumen terpilih ke folder tujuan lalu kosongkan seleksi. */
export function bulkMove(isi: IsiDraft, sel: Selection, folderKey: string | null): BulkOutcome {
  const next = moveDrafts(isi, sel, folderKey);
  const label = folderLabel(isi, folderKey);
  const moved = next === isi ? 0 : isi.dokumen.filter((d) => sel.has(d.key) && d.folderKey !== folderKey).length;
  const notice: Notice =
    moved > 0
      ? { message: `${moved} dokumen dipindahkan ke "${label}"`, tone: 'success' }
      : { message: `Dokumen terpilih sudah berada di "${label}"`, tone: 'info' };
  return { ...notice, isi: next, selection: emptySelection() };
}

/** Salin dokumen terpilih ke folder tujuan (yang sudah ada di sana dilewati) lalu kosongkan seleksi. */
export function bulkCopy(isi: IsiDraft, sel: Selection, folderKey: string | null): BulkOutcome {
  const result = copyDrafts(isi, sel, folderKey);
  return { ...copyNotice(result), isi: result.isi, selection: emptySelection() };
}

/** Hapus dokumen terpilih dari draft lalu kosongkan seleksi. */
export function bulkDelete(isi: IsiDraft, sel: Selection): BulkOutcome {
  const count = isi.dokumen.filter((d) => sel.has(d.key)).length;
  const notice: Notice =
    count > 0 ? { message: `${count} dokumen dihapus`, tone: 'success' } : { message: 'Tidak ada dokumen dihapus', tone: 'info' };
  return { ...notice, isi: deleteDrafts(isi, sel), selection: emptySelection() };
}

/** Duplikat folder beserta dokumennya; gagal (mis. batas folder) → isi tetap + notifikasi error. */
export function duplicateFolderAction(isi: IsiDraft, folderKey: string): FolderOutcome {
  const result = duplicateFolder(isi, folderKey);
  if (result.error !== null || result.folderKey === null) {
    return { isi, message: result.error ?? 'Folder gagal diduplikat', tone: 'error' };
  }
  return { isi: result.isi, message: `Folder "${folderLabel(result.isi, result.folderKey)}" dibuat`, tone: 'success' };
}

/** Salin seluruh isi folder asal ke folder tujuan (aturan lewati sama dengan salin dokumen). */
export function copyFolderContentsAction(isi: IsiDraft, fromKey: string | null, toKey: string | null): FolderOutcome {
  const result = copyFolderContents(isi, fromKey, toKey);
  return { ...copyNotice(result), isi: result.isi };
}

/** Isi siap disimpan: judul dokumen terisi, folder valid, dan tidak ada berkas ganda dalam satu folder. */
export function isIsiDraftValid(isi: IsiDraft): boolean {
  return isDraftListValid(isi.dokumen) && isFolderListValid(isi.folders) && duplicateFileError(isi) === null;
}
