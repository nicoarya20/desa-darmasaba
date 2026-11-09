// Logika murni draft dokumen di form admin Desa Anti Korupsi (create & edit):
// urutan naik/turun, judul default dari nama berkas, upload berkas tertunda, payload API.
import type { DokumenDesaAntiKorupsiView, DokumenInput } from '@/lib/desa-anti-korupsi-dokumen';
import type { FolderRef } from '@/lib/desa-anti-korupsi-folder';

/**
 * Draft satu dokumen di form: `id` = dokumen tersimpan, `file` = berkas lokal yang belum diunggah,
 * `folderKey` = key FolderDraft tujuan (null = folder virtual "Umum").
 */
export type DokumenDraft = {
  key: string;
  folderKey: string | null;
  id?: string;
  fileId?: string;
  judul: string;
  file?: File;
  link?: string;
  mimeType?: string;
  realName?: string;
};

/** Hasil upload berkas ke FileStorage yang dibutuhkan draft. */
export type UploadedFile = { id: string; link: string; mimeType: string; realName: string };

let draftSeq = 0;
const nextKey = () => `draft-${++draftSeq}`;

/** Pindahkan item ke atas (-1) atau bawah (+1); di ujung daftar → daftar dikembalikan apa adanya. */
export function moveDokumen<T>(list: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) {
    return [...list];
  }
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Judul default dokumen: nama berkas tanpa ekstensi (fallback nama utuh). */
export function judulFromFileName(fileName: string): string {
  const trimmed = fileName.trim();
  const dot = trimmed.lastIndexOf('.');
  const base = dot > 0 ? trimmed.slice(0, dot) : trimmed;
  return base.trim() || trimmed;
}

/** Draft baru (belum diunggah) dari berkas yang dipilih di Dropzone, langsung masuk folder tujuan. */
export function draftsFromFiles(files: File[], folderKey: string | null = null): DokumenDraft[] {
  return files.map((file) => ({
    key: nextKey(),
    folderKey,
    judul: judulFromFileName(file.name),
    file,
    mimeType: file.type,
    realName: file.name,
  }));
}

/** Draft dari dokumen yang sudah tersimpan (respons API) di folder `folderKey`. */
export function draftsFromSaved(
  dokumen: readonly DokumenDesaAntiKorupsiView[],
  folderKey: string | null = null,
): DokumenDraft[] {
  return dokumen.map((d) => ({
    key: d.id,
    folderKey,
    id: d.id,
    fileId: d.fileId,
    judul: d.judul,
    link: d.file.link,
    mimeType: d.file.mimeType,
    realName: d.file.realName,
  }));
}

/** Judul semua draft terisi (judul kosong ditolak API). */
export function isDraftListValid(drafts: readonly DokumenDraft[]): boolean {
  return drafts.every((d) => d.judul.trim() !== '');
}

/** Unggah berkas draft yang belum punya fileId (berurutan), kembalikan draft yang semuanya ber-fileId. */
export async function uploadPendingDrafts(
  drafts: readonly DokumenDraft[],
  upload: (file: File) => Promise<UploadedFile>,
): Promise<DokumenDraft[]> {
  const result: DokumenDraft[] = [];
  for (const draft of drafts) {
    if (draft.fileId || !draft.file) {
      result.push(draft);
      continue;
    }
    const uploaded = await upload(draft.file);
    result.push({
      ...draft,
      file: undefined,
      fileId: uploaded.id,
      link: uploaded.link,
      mimeType: uploaded.mimeType,
      realName: uploaded.realName,
    });
  }
  return result;
}

/**
 * Payload `dokumen` untuk API: urutan = posisi di dalam foldernya, judul di-trim, `folderRef`
 * menerjemahkan folderKey draft menjadi rujukan folder API.
 */
export function toDokumenPayload(
  drafts: readonly DokumenDraft[],
  folderRef: (folderKey: string | null) => FolderRef = () => null,
): DokumenInput[] {
  const posisi = new Map<string | null, number>();
  return drafts.map((d) => {
    if (!d.fileId) throw new Error(`Dokumen "${d.judul}" belum diunggah`);
    const urutan = posisi.get(d.folderKey) ?? 0;
    posisi.set(d.folderKey, urutan + 1);
    return {
      ...(d.id ? { id: d.id } : {}),
      fileId: d.fileId,
      judul: d.judul.trim(),
      urutan,
      folder: folderRef(d.folderKey),
    };
  });
}
