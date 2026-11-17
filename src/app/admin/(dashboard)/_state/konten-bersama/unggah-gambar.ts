import ApiFetch from "@/lib/api-fetch";
import { hapusBerkas } from "@/lib/file-storage-delete.client";
import { getServerMessage } from "@/utils/api-message";

/** Unggah satu gambar ke file storage (MinIO); mengembalikan id FileStorage atau melempar Error berpesan jelas. */
export async function unggahGambar(file: File): Promise<string> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  const id = res.data?.data?.id;
  if (!id) {
    throw new Error(getServerMessage(res) ?? "Gagal mengunggah gambar, silakan coba lagi");
  }
  return id;
}

/**
 * Hapus permanen berkas yang sudah terunggah tetapi gagal didaftarkan ke data (tidak ada yang bisa dipulihkan).
 * Aman: belum ada baris yang mereferensikannya. Kegagalan dicatat (`tag` = konteks, mis. "galeri BUMDes")
 * agar berkas yatim bisa dilacak.
 */
export async function hapusUnggahanYatim(imageIds: readonly string[], tag: string): Promise<void> {
  const hasil = await Promise.allSettled(imageIds.map((id) => hapusBerkas(id)));
  const gagal = imageIds.filter((_, i) => hasil[i].status === "rejected");
  if (gagal.length > 0) {
    console.error(`[${tag}] Gagal membersihkan ${gagal.length} berkas yatim:`, gagal);
  }
}
