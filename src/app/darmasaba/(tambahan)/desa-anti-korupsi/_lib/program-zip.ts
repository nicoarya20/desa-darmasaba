// Alur tombol unduh ZIP halaman program publik: panggil helper klien, salurkan pesan gagal ke UI.
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { DAK_ZIP_DEFAULT_MAX_BYTES } from '@/lib/desa-anti-korupsi-zip';
import { unduhZipDak, type UnduhZipResult } from '@/lib/desa-anti-korupsi-zip-client';

/** Petunjuk batas ukuran ZIP (default server; override env `DAK_ZIP_MAX_BYTES` tidak terlihat di klien). */
export const ZIP_HINT = `Maks. ${formatUkuran(DAK_ZIP_DEFAULT_MAX_BYTES)} per unduhan`;

type Deps = { unduh?: typeof unduhZipDak; onGagal: (message: string) => void };

/** Unduh ZIP program/folder; gagal → `onGagal(pesan ramah)` (unduhZipDak tidak pernah melempar). */
export async function jalankanUnduhZip(
  programId: string,
  folder: string | null,
  { unduh = unduhZipDak, onGagal }: Deps,
): Promise<UnduhZipResult> {
  const result = await unduh(programId, folder);
  if (!result.ok) onGagal(result.message);
  return result;
}
