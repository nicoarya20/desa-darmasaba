// Logika murni folder di form admin Desa Anti Korupsi: kelola folder (tambah, ganti nama, hapus →
// dokumen ke "Umum", urutan), kelompokkan & pindahkan dokumen antar folder, serta payload API.
import {
  FOLDER_MAX_PER_PROGRAM,
  FOLDER_NAMA_MAX_LENGTH,
  FOLDER_UMUM_LABEL,
  folderNamaKey,
  type FolderInput,
  type FolderRef,
} from '@/lib/desa-anti-korupsi-folder';
import type { DokumenInput } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderDokumenView } from '@/lib/desa-anti-korupsi-view';
import { draftsFromSaved, moveDokumen, toDokumenPayload, type DokumenDraft } from './dokumen-draft';

/** Draft satu folder: `id` = folder tersimpan (key = id), tanpa `id` = folder baru (key jadi tempKey). */
export type FolderDraft = { key: string; id?: string; nama: string };

/** Seluruh isi program yang sedang diedit: folder berurutan + dokumen (urutan = posisi per folder). */
export type IsiDraft = { folders: FolderDraft[]; dokumen: DokumenDraft[] };

/** Satu kelompok dokumen untuk ditampilkan: folder nyata atau "Umum" (key null). */
export type DraftGroup = { key: string | null; nama: string; dokumen: DokumenDraft[] };

let folderSeq = 0;

/** Isi kosong untuk form create. */
export function emptyIsiDraft(): IsiDraft {
  return { folders: [], dokumen: [] };
}

/** Draft isi dari detail program (respons findUnique). */
export function isiDraftFromDetail(detail: {
  folders: readonly FolderDokumenView[];
  dokumenUmum: FolderDokumenView['dokumen'];
}): IsiDraft {
  return {
    folders: detail.folders.map((f) => ({ key: f.id, id: f.id, nama: f.nama })),
    dokumen: [...detail.folders.flatMap((f) => draftsFromSaved(f.dokumen, f.id)), ...draftsFromSaved(detail.dokumenUmum)],
  };
}

/** Tambah folder baru di akhir dengan nama default unik ("Folder baru", "Folder baru 2", ...). */
export function addFolder(isi: IsiDraft): IsiDraft {
  const used = new Set(isi.folders.map((f) => folderNamaKey(f.nama)));
  let nama = 'Folder baru';
  for (let n = 2; used.has(folderNamaKey(nama)); n++) nama = `Folder baru ${n}`;
  return { ...isi, folders: [...isi.folders, { key: `folder-baru-${++folderSeq}`, nama }] };
}

/** Ganti nama folder (validasi tampil lewat `folderNamaError`). */
export function renameFolder(isi: IsiDraft, key: string, nama: string): IsiDraft {
  return { ...isi, folders: isi.folders.map((f) => (f.key === key ? { ...f, nama } : f)) };
}

/** Hapus folder; dokumennya pindah ke "Umum" (di akhir daftar Umum), tidak ikut terhapus. */
export function removeFolder(isi: IsiDraft, key: string): IsiDraft {
  const pindah = isi.dokumen.filter((d) => d.folderKey === key).map((d) => ({ ...d, folderKey: null }));
  return {
    folders: isi.folders.filter((f) => f.key !== key),
    dokumen: [...isi.dokumen.filter((d) => d.folderKey !== key), ...pindah],
  };
}

/** Naik (-1) / turun (+1) urutan folder. */
export function moveFolder(isi: IsiDraft, index: number, direction: -1 | 1): IsiDraft {
  return { ...isi, folders: moveDokumen(isi.folders, index, direction) };
}

/** Pesan error nama folder (wajib, panjang, unik per program tanpa beda kapital/spasi) atau null. */
export function folderNamaError(folders: readonly FolderDraft[], key: string): string | null {
  const folder = folders.find((f) => f.key === key);
  if (!folder) return null;
  const nama = folder.nama.trim();
  if (nama === '') return 'Nama folder wajib diisi';
  if (nama.length > FOLDER_NAMA_MAX_LENGTH) return `Maksimal ${FOLDER_NAMA_MAX_LENGTH} karakter`;
  const dup = folders.some((f) => f.key !== key && folderNamaKey(f.nama) === folderNamaKey(nama));
  return dup ? 'Nama folder sudah dipakai' : null;
}

/** Semua folder valid dan jumlahnya dalam batas. */
export function isFolderListValid(folders: readonly FolderDraft[]): boolean {
  return folders.length <= FOLDER_MAX_PER_PROGRAM && folders.every((f) => folderNamaError(folders, f.key) === null);
}

/** Kelompokkan dokumen per folder (urut folder), "Umum" di akhir; urutan dokumen = urutan array. */
export function groupDrafts(isi: IsiDraft): DraftGroup[] {
  const groups: DraftGroup[] = isi.folders.map((f) => ({ key: f.key, nama: f.nama, dokumen: [] }));
  const umum: DraftGroup = { key: null, nama: FOLDER_UMUM_LABEL, dokumen: [] };
  const byKey = new Map(groups.map((g) => [g.key, g]));
  for (const d of isi.dokumen) ((d.folderKey && byKey.get(d.folderKey)) || umum).dokumen.push(d);
  return [...groups, umum];
}

/** Pindahkan dokumen ke folder lain (masuk di akhir folder tujuan). */
export function moveDraftToFolder(isi: IsiDraft, dokumenKey: string, folderKey: string | null): IsiDraft {
  const target = isi.dokumen.find((d) => d.key === dokumenKey);
  if (!target || target.folderKey === folderKey) return isi;
  return { ...isi, dokumen: [...isi.dokumen.filter((d) => d.key !== dokumenKey), { ...target, folderKey }] };
}

/** Naik (-1) / turun (+1) dokumen di dalam foldernya sendiri. */
export function moveDraftWithinFolder(isi: IsiDraft, dokumenKey: string, direction: -1 | 1): IsiDraft {
  const target = isi.dokumen.find((d) => d.key === dokumenKey);
  if (!target) return isi;
  const posisi = isi.dokumen.flatMap((d, i) => (d.folderKey === target.folderKey ? [i] : []));
  const at = posisi.findIndex((i) => isi.dokumen[i].key === dokumenKey);
  const swapWith = posisi[at + direction];
  if (swapWith === undefined) return isi;
  const dokumen = [...isi.dokumen];
  [dokumen[posisi[at]], dokumen[swapWith]] = [dokumen[swapWith], dokumen[posisi[at]]];
  return { ...isi, dokumen };
}

/** Payload `folders` + `dokumen` untuk API (satu PUT/POST); folder baru dirujuk lewat tempKey. */
export function toIsiPayload(isi: IsiDraft): { folders: FolderInput[]; dokumen: DokumenInput[] } {
  const byKey = new Map(isi.folders.map((f) => [f.key, f]));
  const folderRef = (key: string | null): FolderRef => {
    if (key === null) return null;
    const folder = byKey.get(key);
    if (!folder) throw new Error(`Folder draft "${key}" tidak ditemukan`);
    return folder.id ? { id: folder.id } : { tempKey: folder.key };
  };
  return {
    folders: isi.folders.map((f, urutan) => ({
      ...(f.id ? { id: f.id } : { tempKey: f.key }),
      nama: f.nama.trim(),
      urutan,
    })),
    dokumen: toDokumenPayload(isi.dokumen, folderRef),
  };
}
