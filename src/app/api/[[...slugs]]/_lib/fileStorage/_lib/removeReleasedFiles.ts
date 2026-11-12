import removeStoredFile from "./removeStoredFile";

/** ID berkas yang dirujuk record; null/undefined/"" = tidak ada berkas. */
export type FileIdRef = string | null | undefined;

/** Ratakan rujukan berkas record (ID tunggal atau relasi daftar `{ id }`, mis. galeri) menjadi daftar ID. */
export function fileIds(...refs: (FileIdRef | readonly { id: string }[])[]): FileIdRef[] {
  return refs.flatMap((ref) => (Array.isArray(ref) ? ref.map((f) => f.id) : [ref as FileIdRef]));
}

/**
 * Hapus permanen berkas yang dirujuk record `sebelum` operasi DB tetapi tidak lagi dirujuk `sesudah`-nya
 * (delete: `sesudah` kosong). Dipanggil SETELAH delete/update record sukses; berkas yang masih dirujuk data lain
 * dibiarkan (`removeStoredFile`). Duplikat diabaikan, urutan pertama dipertahankan.
 */
export default async function removeReleasedFiles(
  owner: string,
  sebelum: readonly FileIdRef[],
  sesudah: readonly FileIdRef[] = [],
): Promise<void> {
  const tetap = new Set(sesudah.filter(Boolean));
  const dilepas = new Set(sebelum.filter((id): id is string => !!id && !tetap.has(id)));
  for (const id of dilepas) await removeStoredFile({ id }, owner);
}
