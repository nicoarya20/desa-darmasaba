import Elysia, { t } from "elysia";
import penjualanProdukCreate from "./create";
import penjualanProdukDelete from "./del";
import penjualanProdukFindMany from "./findMany";
import penjualanProdukFindUnique from "./findUnique";
import penjualanProdukPesan from "./pesan";
import { PESAN_MAX_JUMLAH } from "./_pesan";
import penjualanProdukUpdate from "./updt";

const PenjualanProduk = new Elysia({
  prefix: "/umkm/penjualan",
  tags: ["Ekonomi/UMKM Penjualan"],
})
  .get("/find-many", penjualanProdukFindMany)
  .get("/:id", penjualanProdukFindUnique, {
    params: t.Object({
      id: t.String(),
    }),
  })
  .post("/create", penjualanProdukCreate, {
    body: t.Object({
      produkId: t.String(),
      jumlah: t.Number(),
      hargaSatuan: t.Number(),
      tanggal: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  // Publik (whitelist PUBLIC_POST_PATHS): harga diambil server dari DB, bukan klien.
  .post("/pesan", penjualanProdukPesan, {
    body: t.Object({
      produkId: t.String({ minLength: 1 }),
      jumlah: t.Integer({ minimum: 1, maximum: PESAN_MAX_JUMLAH }),
    }),
  })
  .put("/:id", penjualanProdukUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      produkId: t.String(),
      jumlah: t.Number(),
      hargaSatuan: t.Number(),
      tanggal: t.Optional(t.String()),
      isActive: t.Boolean(),
    }),
  })
  .delete("/del/:id", penjualanProdukDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default PenjualanProduk;
