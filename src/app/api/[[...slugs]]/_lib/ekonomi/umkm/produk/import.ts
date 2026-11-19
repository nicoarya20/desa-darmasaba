import { susunRencanaProduk } from "@/lib/umkm/produk-impor-rencana";
import { buatHandlerImpor, potongan } from "../_impor-handler";

/**
 * POST /umkm/produk/import — impor Produk dari CSV (admin saja). UMKM dicocokkan by nama (+ pemilik bila kembar),
 * kategori by nama; tidak ada yang dibuat otomatis. Link toko online baru ditulis atomik bersama produk.
 */
export default buatHandlerImpor({
  objek: "produk",
  pesanAdmin: "Hanya admin yang boleh mengimpor data produk UMKM",
  logLabel: "produkImport",
  susun: async (db, body) => {
    const kategori = await db.kategoriProdukUmkm.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, nama: true },
    });
    const umkm = await db.umkm.findMany({
      where: { deletedAt: null },
      select: { id: true, nama: true, pemilik: true, isActive: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const ada = await db.pasarDesa.findMany({
      where: { deletedAt: null },
      select: { id: true, umkmId: true, nama: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return susunRencanaProduk({ rows: body.rows, mode: body.mode, kategori, umkm, ada });
  },
  tulis: async (tx, r) => {
    // createMany tidak mengembalikan id, jadi produk berlink dibuat satu per satu dengan nested create (atomik);
    // produk tanpa link tetap massal.
    const tanpaLink: Omit<(typeof r.tambah)[number], "link">[] = [];
    for (const { link, ...data } of r.tambah) {
      if (link.length === 0) tanpaLink.push(data);
      else await tx.pasarDesa.create({ data: { ...data, linkTokoOnline: { create: link } } });
    }
    for (const data of potongan(tanpaLink)) await tx.pasarDesa.createMany({ data });
    for (const p of r.perbarui) {
      if (p.gantiLink) {
        await tx.linkTokoOnline.deleteMany({ where: { produkId: p.id } });
        await tx.linkTokoOnline.createMany({ data: p.gantiLink.map((l) => ({ ...l, produkId: p.id })) });
      }
      await tx.pasarDesa.update({ where: { id: p.id }, data: p.data });
    }
  },
  jumlah: (r) => ({ ditambah: r.tambah.length, diperbarui: r.perbarui.length, dilewati: r.dilewati }),
  tambahan: (r) => ({ linkDiganti: r.linkDiganti }),
});
