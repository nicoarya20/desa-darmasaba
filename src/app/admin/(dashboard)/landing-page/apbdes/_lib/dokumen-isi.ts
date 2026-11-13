// Simpan isi dokumen APBDes dari editor folder bersama (milik Desa Anti Korupsi, dipakai ulang apa adanya):
// unggah berkas draft yang tertunda ke FileStorage (MinIO), lalu bentuk payload folders + dokumen API.
import type { ApbdesIsiPayload } from '@/app/admin/(dashboard)/_state/landing-page/apbdes';
import { uploadPendingDrafts, type UploadedFile } from '../../desa-anti-korupsi/_lib/dokumen-draft';
import { toIsiPayload, type IsiDraft } from '../../desa-anti-korupsi/_lib/folder-draft';
import { uploadDokumenFile } from '../../desa-anti-korupsi/_lib/upload-dokumen';

/**
 * Unggah berkas baru di draft (berurutan) lalu kembalikan draft yang sudah ber-fileId + payload API.
 * Berkas diunggah saat Simpan, bukan saat dipilih, agar batal tidak meninggalkan berkas yatim.
 */
export async function prepareApbdesIsi(
  isi: IsiDraft,
  upload: (file: File) => Promise<UploadedFile> = uploadDokumenFile,
): Promise<{ isi: IsiDraft; payload: ApbdesIsiPayload }> {
  const uploaded: IsiDraft = { ...isi, dokumen: await uploadPendingDrafts(isi.dokumen, upload) };
  return { isi: uploaded, payload: toIsiPayload(uploaded) };
}
