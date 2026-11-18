import Elysia, { t } from "elysia";
import { PRODUK_HUKUM_REORDER_MAX } from "@/lib/produk-hukum";
import produkHukumCreate from "./create";
import produkHukumDelete from "./del";
import produkHukumFindById from "./find-by-id";
import produkHukumFindMany from "./find-many";
import produkHukumReorder from "./reorder";
import produkHukumUpdate from "./updt";

// Tipe dasar saja; aturan isi (judul teks polos, tahun 1900-2100, kategori sah) divalidasi di parseProdukHukumInput
// supaya pesan galat seragam.
const produkHukumBody = t.Object({
  judul: t.String(),
  nomor: t.Optional(t.Union([t.String(), t.Null()])),
  tahun: t.Optional(t.Union([t.Number(), t.Null()])),
  kategori: t.String(),
  fileId: t.Optional(t.Union([t.String(), t.Null()])),
});

/** Produk hukum desa (Perdes, Peraturan Perbekel, SK Perbekel, dll). GET publik; mutasi admin-only di handler. */
const ProdukHukum = new Elysia({ prefix: "/produkhukum", tags: ["Desa/Produk Hukum"] })
  .get("/find-many", produkHukumFindMany)
  .get("/:id", produkHukumFindById)
  .post("/create", produkHukumCreate, { body: produkHukumBody })
  .put("/updt/:id", produkHukumUpdate, { body: produkHukumBody })
  .put("/reorder", produkHukumReorder, {
    body: t.Object({ ids: t.Array(t.String(), { minItems: 1, maxItems: PRODUK_HUKUM_REORDER_MAX }) }),
  })
  .delete("/del/:id", produkHukumDelete);

export default ProdukHukum;
