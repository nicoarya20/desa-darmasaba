import prisma from "@/lib/prisma";
import { createJudulEntitySource } from "./judul-entity.source";
import { TRASHED_WHERE } from "./entity-select";

/** Sumber Sampah: dokumen perencanaan (RPJM/RKP/berita acara) yang dihapus; pulihkan = aktif lagi apa adanya. */
export const dokumenPerencanaanSampahSource = createJudulEntitySource({
  key: "perencanaan",
  menuId: "desa.kegiatan-desa",
  db: () => prisma.dokumenPerencanaan,
  async restore(id) {
    const { count } = await prisma.dokumenPerencanaan.updateMany({
      where: { id, ...TRASHED_WHERE },
      data: { isActive: true, deletedAt: null },
    });
    return count === 0
      ? { ok: false, status: 404, message: "Dokumen tidak ada di Sampah" }
      : { ok: true, message: "Dokumen dipulihkan" };
  },
});
