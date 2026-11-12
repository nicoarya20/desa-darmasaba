import prisma from "@/lib/prisma";
import { dakRetensiHari, pulihkanDokumenDak } from "../../../landing_page/desa-anti-korupsi/sampah-pulihkan";
import { createJudulEntitySource } from "./judul-entity.source";

/** Sumber Sampah: dokumen Desa Anti Korupsi yang dihapus dari folder program (pulihkan = aturan panel DAK). */
export const dokumenDakSampahSource = createJudulEntitySource({
  key: "dak",
  menuId: "landing-page.desa-anti-korupsi",
  retensiHari: dakRetensiHari,
  db: () => prisma.dokumenDesaAntiKorupsi,
  async restore(id, now) {
    const result = await pulihkanDokumenDak(id, now);
    return result.ok ? { ok: true, message: "Dokumen dipulihkan" } : result;
  },
});
