/**
 * Logika murni field "File Peta Wilayah" (tanpa React/DOM). File baru hanya diunggah saat Simpan
 * (pola lampiran Pengumuman), sehingga Batal tidak meninggalkan berkas yatim di MinIO.
 */
import { GAMBAR_MAX_BYTES } from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/dokumentasi.logic';
import { DOKUMEN_PDF_MAX_BYTES } from '@/app/admin/(dashboard)/pemerintahan/pengumuman/list-pengumuman/_lib/lampiran.logic';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import {
  jenisFilePeta,
  PETA_FILE_MIME_PDF,
  type JenisFilePeta,
  type WilayahPetaFile,
} from '@/lib/wilayah-desa';

/** Dropzone: gambar JPG/PNG/WebP atau PDF (mime + ekstensi, lihat docs/DESIGN.md react-dropzone 20). */
export const PETA_FILE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  [PETA_FILE_MIME_PDF]: ['.pdf'],
};

/** Batas dropzone = batas terbesar (PDF); batas gambar dicek di `periksaFilePilihan`. */
export const PETA_FILE_MAX_BYTES = Math.max(GAMBAR_MAX_BYTES, DOKUMEN_PDF_MAX_BYTES);

export const PETA_FILE_KETERANGAN =
  `Gambar (JPG, PNG, WebP) maks ${formatUkuran(GAMBAR_MAX_BYTES)} atau PDF maks ${formatUkuran(DOKUMEN_PDF_MAX_BYTES)}. ` +
  'Ditampilkan di atas peta embed.';

/** File peta di form: tersimpan (`id`) atau baru dipilih (`file`); `link` = URL tersimpan / object URL. */
export type PetaFileForm = {
  id: string | null;
  file: File | null;
  link: string;
  nama: string;
  size: number | null;
  jenis: JenisFilePeta | null;
};

/** Pesan error bila file tidak boleh dipakai sebagai peta; null = boleh. */
export function periksaFilePilihan(file: { type: string; size: number }): string | null {
  const jenis = jenisFilePeta(file.type);
  if (!jenis) return 'File peta harus berupa gambar (JPG, PNG, WebP) atau PDF';
  const max = jenis === 'pdf' ? DOKUMEN_PDF_MAX_BYTES : GAMBAR_MAX_BYTES;
  if (file.size > max) return `Ukuran ${jenis === 'pdf' ? 'PDF' : 'gambar'} maksimal ${formatUkuran(max)}`;
  return null;
}

/** File tersimpan dari API → nilai form (null = belum ada file peta). */
export function petaFileDariApi(file: WilayahPetaFile | null | undefined): PetaFileForm | null {
  if (!file) return null;
  return {
    id: file.id,
    file: null,
    link: file.link,
    nama: file.realName,
    size: file.size ?? null,
    jenis: jenisFilePeta(file.mimeType),
  };
}

/**
 * Nilai `petaFileId` untuk body API: file baru diunggah → id baru; tidak berubah dari `awalId` → undefined
 * (field tidak dikirim); dihapus → null.
 */
export async function resolvePetaFileId(
  awalId: string | null,
  peta: PetaFileForm | null,
  upload: (file: File) => Promise<string>,
): Promise<string | null | undefined> {
  if (peta?.file) {
    try {
      return await upload(peta.file);
    } catch (error) {
      console.error('Upload file peta wilayah gagal:', error);
      throw new Error(`Gagal mengunggah file peta "${peta.file.name}", silakan coba lagi`);
    }
  }
  const id = peta?.id ?? null;
  return id === awalId ? undefined : id;
}
