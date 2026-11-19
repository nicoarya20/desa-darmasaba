import { susunRencanaImpor } from "@/lib/umkm/umkm-impor-rencana";
import { buatHandlerImpor, potongan } from "./_impor-handler";

/**
 * POST /umkm/import — impor UMKM dari CSV (admin saja). Baca kategori aktif + UMKM yang belum dihapus
 * (terlama dulu, supaya kunci kembar selalu jatuh ke yang sama).
 */
export default buatHandlerImpor({
  objek: "UMKM",
  pesanAdmin: "Hanya admin yang boleh mengimpor data UMKM",
  logLabel: "umkmImport",
  susun: async (db, body) => {
    const kategori = await db.kategoriProdukUmkm.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, nama: true },
    });
    const ada = await db.umkm.findMany({
      where: { deletedAt: null },
      select: { id: true, nama: true, pemilik: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return susunRencanaImpor({ rows: body.rows, mode: body.mode, kategori, ada });
  },
  tulis: async (tx, r) => {
    for (const data of potongan(r.tambah)) await tx.umkm.createMany({ data });
    for (const u of r.perbarui) await tx.umkm.update({ where: { id: u.id }, data: u.data });
  },
  jumlah: (r) => ({ ditambah: r.tambah.length, diperbarui: r.perbarui.length, dilewati: r.dilewati }),
});
