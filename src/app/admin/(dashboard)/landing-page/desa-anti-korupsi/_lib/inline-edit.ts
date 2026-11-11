// Aturan murni ganti nama inline (judul dokumen & nama folder) di editor admin Desa Anti Korupsi.

/** Validasi nilai baru; kembalikan pesan error atau null bila valid. */
export type InlineValidate = (value: string) => string | null;

/** Hasil commit: simpan nilai baru, tidak ada perubahan, atau tolak (kembali ke nilai lama + pesan). */
export type InlineCommit =
  | { action: 'save'; value: string }
  | { action: 'unchanged' }
  | { action: 'reject'; message: string };

/** Putuskan hasil commit input inline: nilai di-trim, divalidasi, dan dibandingkan dengan nilai lama. */
export function resolveInlineCommit(previous: string, next: string, validate?: InlineValidate): InlineCommit {
  const value = next.trim();
  const message = validate?.(value) ?? null;
  if (message !== null) return { action: 'reject', message };
  return value === previous.trim() ? { action: 'unchanged' } : { action: 'save', value };
}

/** Validasi judul dokumen: wajib diisi (API menolak judul kosong). */
export const judulDokumenError: InlineValidate = (value) => (value.trim() === '' ? 'Judul wajib diisi' : null);
