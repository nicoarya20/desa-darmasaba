// Hapus berkas permanen (klien admin: Pustaka File, unggahan yatim galeri BUMDes): DELETE /api/fileStorage/delete/:id.
//
// Sengaja fetch biasa, bukan Eden: segmen path "delete" bentrok dengan nama method Eden, sehingga
// `ApiFetch.api.fileStorage.delete({ id })` justru mengirim DELETE /api/fileStorage (route tidak ada) dan
// `.delete({ id }).delete()` lolos tsc tetapi melempar TypeError saat runtime.
import { getServerMessage } from "@/utils/api-message";

/** Pesan sukses hapus dari pustaka file (backend menghapus berkas permanen). */
export const PESAN_BERKAS_DIHAPUS = "Berkas dihapus permanen";

/** Hapus permanen satu berkas; melempar Error berkonteks bila ditolak (mis. 409 masih dipakai data lain). */
export async function hapusBerkas(id: string): Promise<void> {
  let res: Response;
  try {
    // Tanpa body & Content-Type: DELETE ber-Content-Type JSON tanpa body ditolak 400 oleh parser Elysia.
    res = await fetch(`/api/fileStorage/delete/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (err) {
    throw new Error(`Gagal menghapus berkas ${id}: ${err instanceof Error ? err.message : String(err)}`);
  }
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP jadi alasan di pesan error.
  const body: unknown = await res.json().catch(() => null);
  // Sukses selalu memuat deletedId; handler juga mengembalikan { status: 404, body } dengan HTTP 200.
  if (res.ok && body && typeof body === "object" && "deletedId" in body) return;
  const alasan = getServerMessage(body) ?? `HTTP ${res.status}`;
  throw new Error(`Gagal menghapus berkas ${id}: ${alasan}`);
}
