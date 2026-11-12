import prisma from "@/lib/prisma";
import { dakRetensiHari, pulihkanDokumenDak } from "../../landing_page/desa-anti-korupsi/sampah-pulihkan";
import { createJudulEntitySource } from "./judul-entity.source";

/**
 * Sumber Sampah: dokumen Desa Anti Korupsi yang dihapus dari folder program. Tidak dilayani `/api/sampah` (panel DAK
 * punya endpoint sendiri); dipakai purge harian dan hapus permanen panel DAK.
 */
export const dokumenDakSampahSource = createJudulEntitySource({
  key: "dokumen-dak",
  scopeField: "desaAntiKorupsiId",
  berFolder: true,
  retensiHari: dakRetensiHari,
  db: () => prisma.dokumenDesaAntiKorupsi,
  async restore(id, now) {
    const result = await pulihkanDokumenDak(id, now);
    return result.ok ? { ok: true, message: "Dokumen dipulihkan" } : result;
  },
});
