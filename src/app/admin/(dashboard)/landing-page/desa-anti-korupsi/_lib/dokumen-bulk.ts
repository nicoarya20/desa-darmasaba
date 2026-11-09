// Logika murni aksi massal di form admin Desa Anti Korupsi: hapus, pindah, salin dokumen terpilih,
// salin isi folder, dan duplikat folder. Semua mengembalikan IsiDraft baru (tersimpan saat Simpan).
import {
  FOLDER_MAX_PER_PROGRAM,
  FOLDER_NAMA_MAX_LENGTH,
  FOLDER_UMUM_LABEL,
  folderNamaKey,
} from '@/lib/desa-anti-korupsi-folder';
import type { DokumenDraft } from './dokumen-draft';
import type { FolderDraft, IsiDraft } from './folder-draft';

/** Hasil salin dokumen: isi baru + jumlah yang disalin & dilewati (sudah ada di folder tujuan). */
export type CopyResult = { isi: IsiDraft; copied: number; skipped: number };

/** Hasil duplikat folder: `folderKey` folder baru, atau null + `error` bila gagal. */
export type DuplicateResult = { isi: IsiDraft; folderKey: string | null; error: string | null };

const SALINAN = 'salinan';
let copySeq = 0;

/** Key baru berawalan `prefix` yang belum dipakai di `used`. */
function freshKey(prefix: string, used: ReadonlySet<string>): string {
  let key = `${prefix}-${++copySeq}`;
  while (used.has(key)) key = `${prefix}-${++copySeq}`;
  return key;
}

/** Apakah folder tujuan sudah berisi berkas draft ini (fileId atau objek File yang sama). */
function isAlreadyIn(fileIds: ReadonlySet<string>, files: ReadonlySet<File>, draft: DokumenDraft): boolean {
  return (draft.fileId !== undefined && fileIds.has(draft.fileId)) || (draft.file !== undefined && files.has(draft.file));
}

/** Apakah `folderKey` menunjuk folder yang ada (null = "Umum" selalu ada). */
function folderExists(isi: IsiDraft, folderKey: string | null): boolean {
  return folderKey === null || isi.folders.some((f) => f.key === folderKey);
}

/** Buang dokumen terpilih dari draft (dokumen tersimpan yang hilang di-soft-delete API saat Simpan). */
export function deleteDrafts(isi: IsiDraft, keys: ReadonlySet<string>): IsiDraft {
  return { ...isi, dokumen: isi.dokumen.filter((d) => !keys.has(d.key)) };
}

/** Pindahkan dokumen terpilih ke akhir folder tujuan (urutan relatif terjaga; yang sudah di sana diam). */
export function moveDrafts(isi: IsiDraft, keys: ReadonlySet<string>, folderKey: string | null): IsiDraft {
  if (!folderExists(isi, folderKey)) return isi;
  const pindah = (d: DokumenDraft) => keys.has(d.key) && d.folderKey !== folderKey;
  const moved = isi.dokumen.filter(pindah).map((d) => ({ ...d, folderKey }));
  if (moved.length === 0) return isi;
  return { ...isi, dokumen: [...isi.dokumen.filter((d) => !pindah(d)), ...moved] };
}

/**
 * Salin dokumen terpilih ke akhir folder tujuan sebagai draft baru (tanpa `id`, berkas sama).
 * Dilewati bila folder tujuan sudah berisi fileId atau objek File yang sama.
 */
export function copyDrafts(isi: IsiDraft, keys: ReadonlySet<string>, folderKey: string | null): CopyResult {
  if (!folderExists(isi, folderKey)) return { isi, copied: 0, skipped: 0 };
  const inTarget = isi.dokumen.filter((d) => d.folderKey === folderKey);
  const fileIds = new Set(inTarget.flatMap((d) => (d.fileId ? [d.fileId] : [])));
  const files = new Set(inTarget.flatMap((d) => (d.file ? [d.file] : [])));
  const usedKeys = new Set(isi.dokumen.map((d) => d.key));

  const copies: DokumenDraft[] = [];
  let skipped = 0;
  for (const d of isi.dokumen) {
    if (!keys.has(d.key)) continue;
    if (isAlreadyIn(fileIds, files, d)) {
      skipped++;
      continue;
    }
    const copy: DokumenDraft = { ...d, key: freshKey('copy', usedKeys), folderKey };
    delete copy.id;
    usedKeys.add(copy.key);
    if (copy.fileId) fileIds.add(copy.fileId);
    if (copy.file) files.add(copy.file);
    copies.push(copy);
  }

  if (copies.length === 0) return { isi, copied: 0, skipped };
  return { isi: { ...isi, dokumen: [...isi.dokumen, ...copies] }, copied: copies.length, skipped };
}

/** Salin seluruh isi folder asal ke folder tujuan (aturan lewati sama dengan `copyDrafts`). */
export function copyFolderContents(isi: IsiDraft, fromKey: string | null, toKey: string | null): CopyResult {
  if (fromKey === toKey) return { isi, copied: 0, skipped: 0 };
  const keys = new Set(isi.dokumen.filter((d) => d.folderKey === fromKey).map((d) => d.key));
  return copyDrafts(isi, keys, toKey);
}

/** Pecah "X (salinan)" menjadi nama dasar "X"; nama lain → null. */
function salinanBase(base: string): string | null {
  const match = /^(.*) \(salinan\)$/.exec(base.trim());
  return match ? match[1] : null;
}

/** Potong `prefix` agar `prefix + suffix` muat di FOLDER_NAMA_MAX_LENGTH. */
function fitNama(prefix: string, suffix: string): string {
  return `${prefix.slice(0, Math.max(0, FOLDER_NAMA_MAX_LENGTH - suffix.length)).trimEnd()}${suffix}`;
}

/**
 * Nama folder unik (tanpa beda kapital/spasi): "X (salinan)", "X (salinan 2)", "X (salinan 3)", ...;
 * nama dasar dipotong agar ≤ FOLDER_NAMA_MAX_LENGTH. Base tanpa pola salinan → "base", "base 2", ...
 */
export function uniqueFolderNama(folders: readonly FolderDraft[], base: string): string {
  const used = new Set(folders.map((f) => folderNamaKey(f.nama)));
  const prefix = salinanBase(base);
  const candidate = (n: number): string => {
    if (prefix !== null) return fitNama(prefix, n === 1 ? ` (${SALINAN})` : ` (${SALINAN} ${n})`);
    return fitNama(base.trim(), n === 1 ? '' : ` ${n}`);
  };
  let n = 1;
  while (used.has(folderNamaKey(candidate(n)))) n++;
  return candidate(n);
}

/** Duplikat folder: folder baru "<nama> (salinan)" tepat setelah folder asal, berisi salinan dokumennya. */
export function duplicateFolder(isi: IsiDraft, folderKey: string): DuplicateResult {
  const index = isi.folders.findIndex((f) => f.key === folderKey);
  if (index < 0) return { isi, folderKey: null, error: 'Folder tidak ditemukan' };
  if (isi.folders.length >= FOLDER_MAX_PER_PROGRAM) {
    return { isi, folderKey: null, error: `Maksimal ${FOLDER_MAX_PER_PROGRAM} folder per program` };
  }

  const source = isi.folders[index];
  const folder: FolderDraft = {
    key: freshKey('folder-salinan', new Set(isi.folders.map((f) => f.key))),
    nama: uniqueFolderNama(isi.folders, `${source.nama.trim()} (${SALINAN})`),
  };
  const folders = [...isi.folders.slice(0, index + 1), folder, ...isi.folders.slice(index + 1)];
  const copied = copyFolderContents({ ...isi, folders }, source.key, folder.key);
  return { isi: copied.isi, folderKey: folder.key, error: null };
}

/**
 * Pesan error bila satu folder berisi dua dokumen dengan berkas sama (mis. hasil pindah massal) —
 * API menolaknya saat Simpan; null = aman.
 */
export function duplicateFileError(isi: IsiDraft): string | null {
  const seen = new Map<string | null, { fileIds: Set<string>; files: Set<File> }>();
  for (const d of isi.dokumen) {
    const folder = seen.get(d.folderKey) ?? { fileIds: new Set<string>(), files: new Set<File>() };
    seen.set(d.folderKey, folder);
    if (isAlreadyIn(folder.fileIds, folder.files, d)) {
      const nama = isi.folders.find((f) => f.key === d.folderKey)?.nama ?? FOLDER_UMUM_LABEL;
      return `Berkas dokumen "${d.judul.trim()}" dipakai dua kali di folder "${nama}"`;
    }
    if (d.fileId) folder.fileIds.add(d.fileId);
    if (d.file) folder.files.add(d.file);
  }
  return null;
}
