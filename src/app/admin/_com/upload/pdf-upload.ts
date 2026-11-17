import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";

/** Batas ukuran berkas PDF yang boleh diunggah dari form admin (MB). 20 MB karena SK/Perbekel hasil pindai desa bisa >12 MB. */
export const PDF_MAX_SIZE_MB = 20;

/** Unggah satu PDF lewat jalur FileStorage (MinIO); kembalikan id file, atau null bila gagal (toast sudah tampil). */
export async function uploadPdfFile(file: File): Promise<string | null> {
  try {
    const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
    const id = (res?.data as { data?: { id?: string } } | null)?.data?.id;
    if (!id) toast.error("Gagal mengunggah file PDF");
    return id ?? null;
  } catch (error) {
    console.error(`Gagal mengunggah PDF ${file.name}:`, error);
    toast.error("Terjadi kesalahan saat mengunggah file PDF");
    return null;
  }
}
