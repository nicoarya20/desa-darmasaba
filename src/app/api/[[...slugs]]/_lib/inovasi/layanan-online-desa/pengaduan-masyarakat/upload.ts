import { Context } from "elysia";
import { storeImageAsWebp } from "../../../fileStorage/_lib/storeImage";

// Batas ukuran upload publik pengaduan (warga anonim). Selaras dropzone
// frontend (maxSize 5MB). Dibatasi agar endpoint publik tidak jadi vektor abuse.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Upload gambar khusus form Pengaduan Masyarakat — publik, TANPA login.
// Sengaja terpisah dari /api/fileStorage/create (generik & admin-only): hanya
// terima 1 gambar, validasi mime & ukuran, supaya aman dibuka untuk publik.
export default async function pengaduanMasyarakatUpload(context: Context) {
  const body = context.body as { name?: string; file?: File };
  const file = body?.file;

  if (!file) {
    context.set.status = 400;
    return { success: false, message: "File gambar wajib diisi" };
  }

  if (!file.type.startsWith("image/")) {
    context.set.status = 400;
    return { success: false, message: "File harus berupa gambar" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    context.set.status = 400;
    return { success: false, message: "Ukuran gambar maksimal 5MB" };
  }

  const data = await storeImageAsWebp(file);
  return { success: true, message: "Sukses upload gambar", data };
}
