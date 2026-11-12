import prisma from "@/lib/prisma";
import { SAMPAH_RETENSI_HARI, sampahCutoff } from "@/lib/sampah/sampah-retensi";
import { pulihkanDokumenApbdes } from "../../../landing_page/apbdes/sampah-pulihkan";
import { createJudulEntitySource } from "./judul-entity.source";

/** Sumber Sampah: dokumen APBDes yang dihapus dari daftar dokumen (pulihkan = aturan folder seperti DAK). */
export const dokumenApbdesSampahSource = createJudulEntitySource({
  key: "apbdes",
  menuId: "landing-page.apbdes",
  db: () => prisma.dokumenAPBDes,
  async restore(id, now) {
    const result = await pulihkanDokumenApbdes(id, sampahCutoff(now, SAMPAH_RETENSI_HARI));
    return result.ok ? { ok: true, message: "Dokumen dipulihkan" } : result;
  },
});
