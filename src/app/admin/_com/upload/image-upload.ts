import ApiFetch from "@/lib/api-fetch";
import { toast } from "react-toastify";

/** Batas ukuran gambar yang boleh diunggah dari form admin (MB); server menyimpannya sebagai WebP. */
export const IMAGE_MAX_SIZE_MB = 5;

/** Unggah satu gambar lewat jalur FileStorage (MinIO, jadi WebP); kembalikan id file, atau null bila gagal (toast sudah tampil). */
export async function uploadImageFile(file: File): Promise<string | null> {
  try {
    const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
    const id = (res?.data as { data?: { id?: string } } | null)?.data?.id;
    if (!id) toast.error("Gagal mengunggah gambar");
    return id ?? null;
  } catch (error) {
    console.error(`Gagal mengunggah gambar ${file.name}:`, error);
    toast.error("Terjadi kesalahan saat mengunggah gambar");
    return null;
  }
}
