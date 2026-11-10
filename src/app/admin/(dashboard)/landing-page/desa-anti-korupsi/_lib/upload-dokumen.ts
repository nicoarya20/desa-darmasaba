import ApiFetch from '@/lib/api-fetch';
import type { UploadedFile } from './dokumen-draft';

/** Unggah satu berkas dokumen ke FileStorage (MinIO) lewat endpoint upload admin yang sudah ada. */
export async function uploadDokumenFile(file: File): Promise<UploadedFile> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  const uploaded = res.data?.data;
  if (!uploaded?.id) {
    throw new Error(`Gagal mengunggah dokumen "${file.name}"`);
  }
  return {
    id: uploaded.id,
    link: uploaded.link,
    mimeType: uploaded.mimeType,
    realName: uploaded.realName,
  };
}
