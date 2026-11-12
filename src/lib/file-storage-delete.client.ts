// Hapus berkas dari Pustaka File (klien admin): DELETE /api/fileStorage/delete/:id → berkas pindah ke Sampah.
//
// Sengaja fetch biasa, bukan Eden: segmen path "delete" bentrok dengan nama method Eden, sehingga
// `ApiFetch.api.fileStorage.delete({ id })` justru mengirim DELETE /api/fileStorage (route tidak ada) dan
// `.delete({ id }).delete()` lolos tsc tetapi melempar TypeError saat runtime.
import { SAMPAH_RETENSI_HARI } from "@/lib/sampah/sampah-retensi";
import { getServerMessage } from "@/utils/api-message";

/** Pesan sukses hapus dari pustaka file (backend memindahkan berkas ke Sampah, bukan hapus permanen). */
export const PESAN_BERKAS_KE_SAMPAH = `Berkas dipindah ke Sampah, terhapus permanen setelah ${SAMPAH_RETENSI_HARI} hari`;

/** Pindahkan satu berkas pustaka ke Sampah; melempar Error berkonteks bila ditolak (mis. 409 masih dipakai). */
export async function hapusBerkasKeSampah(id: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`/api/fileStorage/delete/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (err) {
    throw new Error(`Gagal memindahkan berkas ${id} ke Sampah: ${err instanceof Error ? err.message : String(err)}`);
  }
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP jadi alasan di pesan error.
  const body: unknown = await res.json().catch(() => null);
  // Sukses selalu memuat deletedId; handler juga mengembalikan { status: 404, body } dengan HTTP 200.
  if (res.ok && body && typeof body === "object" && "deletedId" in body) return;
  const alasan = getServerMessage(body) ?? `HTTP ${res.status}`;
  throw new Error(`Gagal memindahkan berkas ${id} ke Sampah: ${alasan}`);
}
