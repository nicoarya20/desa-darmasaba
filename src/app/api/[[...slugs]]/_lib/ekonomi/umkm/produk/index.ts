import Elysia, { t } from "elysia";
import { IMPOR_UMKM_MAKS_BARIS } from "@/lib/umkm/umkm-impor.rules";
import produkUmkmCreate from "./create";
import produkUmkmDelete from "./del";
import produkUmkmFindMany from "./findMany";
import produkUmkmFindUnique from "./findUnique";
import produkUmkmImport from "./import";
import produkUmkmUpdate from "./updt";

// Opsional & aditif: tanpa field ini perilaku lama tidak berubah. Aturan isi (https, host, maks 5)
// divalidasi handler lewat util bersama agar pesan errornya konsisten dengan form admin.
const linkTokoOnlineBody = t.Optional(
  t.Array(t.Object({ platform: t.String(), url: t.String() })),
);

const ProdukUmkm = new Elysia({
  prefix: "/umkm/produk",
  tags: ["Ekonomi/UMKM Produk"],
})
  .get("/find-many", produkUmkmFindMany)
  .get("/:id", produkUmkmFindUnique, {
    params: t.Object({
      id: t.String(),
    }),
  })
  .post("/create", produkUmkmCreate, {
    body: t.Object({
      nama: t.String(),
      harga: t.Number(),
      umkmId: t.String(),
      kategoriId: t.String(), // Added validation
      stok: t.Optional(t.Number()),
      deskripsi: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
      satuan: t.Optional(t.String()),
      isUnggulan: t.Optional(t.Boolean()),
      linkTokoOnline: linkTokoOnlineBody,
    }),
  })
  .post("/import", produkUmkmImport, {
    body: t.Object({
      mode: t.Union([t.Literal("lewati"), t.Literal("perbarui")]),
      dryRun: t.Optional(t.Boolean()),
      rows: t.Array(
        t.Object({
          nama: t.String(),
          umkm: t.String(),
          kategori: t.String(),
          harga: t.Number(),
          pemilik: t.Optional(t.String()),
          stok: t.Optional(t.Number()),
          satuan: t.Optional(t.String()),
          deskripsi: t.Optional(t.String()),
          unggulan: t.Optional(t.Boolean()),
          link: t.Optional(
            t.Object({
              shopee: t.Optional(t.String()),
              tokopedia: t.Optional(t.String()),
              tiktok_shop: t.Optional(t.String()),
              blibli: t.Optional(t.String()),
              lazada: t.Optional(t.String()),
              lainnya: t.Optional(t.String()),
            }),
          ),
        }),
        { maxItems: IMPOR_UMKM_MAKS_BARIS },
      ),
    }),
  })
  .put("/:id", produkUmkmUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      nama: t.String(),
      harga: t.Number(),
      umkmId: t.String(),
      kategoriId: t.String(), // Added validation
      stok: t.Number(),
      deskripsi: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      isActive: t.Boolean(),
      satuan: t.Optional(t.String()),
      isUnggulan: t.Optional(t.Boolean()),
      linkTokoOnline: linkTokoOnlineBody,
    }),
  })
  .delete("/del/:id", produkUmkmDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default ProdukUmkm;
