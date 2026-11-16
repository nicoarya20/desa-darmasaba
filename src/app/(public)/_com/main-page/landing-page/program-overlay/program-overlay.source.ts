import ApiFetch from "@/lib/api-fetch";
import { readProgramDetail, type ProgramInovasiDetail } from "./program-overlay.logic";

/**
 * Detail satu program inovasi + galeri dokumentasi (`GET /api/landingpage/programinovasi/:id`).
 * `null` = tidak ditemukan/nonaktif; galat jaringan/server dilempar dengan konteks id.
 */
export async function loadProgramInovasiDetail(id: string): Promise<ProgramInovasiDetail | null> {
  const res = await ApiFetch.api.landingpage.programinovasi({ id })
    .get()
    .catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`detail program inovasi ${id} gagal dimuat: ${reason}`);
    });
  return readProgramDetail(id, res.status, res.data);
}
