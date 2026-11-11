import ApiFetch from "@/lib/api-fetch";
import { getServerMessage } from "@/utils/api-message";

/** Unggah satu gambar BUMDes ke file storage; mengembalikan id FileStorage atau melempar Error berpesan jelas. */
export async function uploadBumdesImage(file: File): Promise<string> {
  const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
  const id = res.data?.data?.id;
  if (!id) {
    throw new Error(getServerMessage(res) ?? "Gagal mengunggah gambar, silakan coba lagi");
  }
  return id;
}
