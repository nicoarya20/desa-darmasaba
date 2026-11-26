import Elysia, { t } from "elysia";
import { guardAdmin } from "../../../../landing_page/desa-anti-korupsi/admin-guard";
import umkmHargaPublikFind from "./find";
import umkmHargaPublikUpdate from "./updt";

export const PESAN_HARGA_PUBLIK_BUKAN_ADMIN = "Hanya admin yang boleh mengubah tampilan harga produk";

// GET publik (dibaca katalog). PUT: guard global route.ts hanya memastikan login, padahal saklar ini mengubah
// tampilan website publik — user Google biasa (role 5) tidak boleh, jadi dicek role admin di sini.
const PengaturanHargaProduk = new Elysia({
  prefix: "/pengaturan",
  tags: ["Ekonomi/UMKM Produk / Pengaturan Harga"],
})
  .get("/find", umkmHargaPublikFind)
  .put("/update", umkmHargaPublikUpdate, {
    beforeHandle: async ({ set }) => (await guardAdmin(set, PESAN_HARGA_PUBLIK_BUKAN_ADMIN)) ?? undefined,
    body: t.Object({ sembunyikanHarga: t.Boolean() }),
  });

export default PengaturanHargaProduk;
