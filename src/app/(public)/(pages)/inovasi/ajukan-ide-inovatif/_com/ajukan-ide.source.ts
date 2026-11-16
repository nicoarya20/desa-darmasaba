import ApiFetch from "@/lib/api-fetch";
import type { IdeForm } from "./ajukan-ide.logic";

type CreateBody = { success?: boolean; message?: string } | null | undefined;

/**
 * Kirim ide warga (endpoint publik). Galat dilempar dengan konteks status; pemanggil menampilkan pesan dan
 * mempertahankan isian. Tidak memakai state admin (state itu memuat ulang find-many admin → 401 di publik).
 */
export async function submitIde(payload: IdeForm): Promise<void> {
  const res = await ApiFetch.api.inovasi.ajukanideinovatif.create.post(payload);
  const body = res.data as CreateBody;
  if (res.status !== 200 || !body?.success) {
    throw new Error(`Kirim ide inovatif gagal (HTTP ${res.status}): ${body?.message ?? "respons tidak valid"}`);
  }
}
