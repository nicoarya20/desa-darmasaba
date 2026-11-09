// Alur tombol unduh ZIP halaman program publik: panggil helper klien, salurkan pesan gagal ke UI.
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import { DAK_ZIP_DEFAULT_MAX_BYTES } from '@/lib/desa-anti-korupsi-zip';
import { unduhZipDak, type UnduhZipResult } from '@/lib/desa-anti-korupsi-zip-client';

/** Petunjuk batas ukuran ZIP (default server; override env `DAK_ZIP_MAX_BYTES` tidak terlihat di klien). */
export const ZIP_HINT = `Maks. ${formatUkuran(DAK_ZIP_DEFAULT_MAX_BYTES)} per unduhan`;

const PESAN_TAK_TERDUGA = 'Gagal menyiapkan unduhan ZIP. Coba lagi atau unduh per dokumen.';

type Deps = { unduh?: typeof unduhZipDak; onGagal: (message: string) => void };

/** Unduh ZIP program/folder; gagal (termasuk error tak terduga saat membaca berkas) → `onGagal(pesan ramah)`. */
export async function jalankanUnduhZip(
  programId: string,
  folder: string | null,
  { unduh = unduhZipDak, onGagal }: Deps,
): Promise<UnduhZipResult> {
  let result: UnduhZipResult;
  try {
    result = await unduh(programId, folder);
  } catch (e) {
    // unduhZipDak tidak menangkap kegagalan `res.blob()` / simpan berkas; ubah jadi pesan agar tidak hilang diam-diam.
    const detail = e instanceof Error ? e.message : String(e);
    result = { ok: false, message: `${PESAN_TAK_TERDUGA} (${detail})` };
  }
  if (!result.ok) onGagal(result.message);
  return result;
}
