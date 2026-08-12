import Elysia, { t } from "elysia";
import produkUmkmCreate from "./create";
import produkUmkmDelete from "./del";
import produkUmkmFindMany from "./findMany";
import produkUmkmFindUnique from "./findUnique";
import produkUmkmUpdate from "./updt";

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
    }),
  })
  .delete("/del/:id", produkUmkmDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default ProdukUmkm;
