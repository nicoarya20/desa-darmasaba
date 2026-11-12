import { Context } from "elysia";
import { purgeStoredFile } from "./purgeStoredFile";

/**
 * DELETE (admin, Pustaka File): hapus permanen berkas — baris FileStorage dulu, lalu objek MinIO. Berkas yang masih
 * dipakai data lain ditolak 409 dan tetap utuh. Query lama `from` (asal menu) tidak dipakai lagi dan diabaikan.
 */
const fileStorageDelete = async (context: Context) => {
  const id = (context.params as { id: string })?.id;

  if (!id) return { status: 400, body: "ID file tidak ditemukan" };

  const result = await purgeStoredFile(id);

  if (result === "referenced") {
    context.set.status = 409;
    return { success: false, message: "File masih dipakai data lain sehingga tidak dihapus" };
  }
  if (result === "missing") return { status: 404, body: "File tidak ditemukan di database" };

  return { message: "File berhasil dihapus", deletedId: id };
};

export default fileStorageDelete;
