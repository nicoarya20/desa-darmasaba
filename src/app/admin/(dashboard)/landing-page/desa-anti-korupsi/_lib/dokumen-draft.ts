// Logika murni draft dokumen di form admin Desa Anti Korupsi (create & edit):
// urutan naik/turun, judul default dari nama berkas, upload berkas tertunda, payload API.
import type { DokumenDesaAntiKorupsiView, DokumenInput } from '@/lib/desa-anti-korupsi-dokumen';

/** Draft satu dokumen di form: `id` = dokumen tersimpan, `file` = berkas lokal yang belum diunggah. */
export type DokumenDraft = {
  key: string;
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

/** Draft baru (belum diunggah) dari berkas yang dipilih di Dropzone. */
export function draftsFromFiles(files: File[]): DokumenDraft[] {
  return files.map((file) => ({
    key: nextKey(),
    judul: judulFromFileName(file.name),
    file,
    mimeType: file.type,
    realName: file.name,
  }));
}

/** Draft dari dokumen yang sudah tersimpan (respons API). */
export function draftsFromSaved(dokumen: readonly DokumenDesaAntiKorupsiView[]): DokumenDraft[] {
  return dokumen.map((d) => ({
    key: d.id,
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

/** Payload `dokumen` untuk API: urutan = posisi di daftar, judul di-trim. */
export function toDokumenPayload(drafts: readonly DokumenDraft[]): DokumenInput[] {
  return drafts.map((d, index) => {
    if (!d.fileId) throw new Error(`Dokumen "${d.judul}" belum diunggah`);
    return {
      ...(d.id ? { id: d.id } : {}),
      fileId: d.fileId,
      judul: d.judul.trim(),
      urutan: index,
    };
  });
}
