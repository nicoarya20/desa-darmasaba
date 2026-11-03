import Elysia, { t } from "elysia";
import wilayahDesaFind from "./find";
import wilayahDesaUpsert from "./upsert";

// Body sengaja longgar (t.Unknown): aturan isi divalidasi zod di handler supaya
// semua error 400 berbentuk { success:false, message } seperti modul lain.
const WilayahDesa = new Elysia({
  prefix: "/wilayah",
  tags: ["Desa/Profile"],
})
  .get("/", async () => wilayahDesaFind())
  .put("/", async ({ body }) => wilayahDesaUpsert(body), {
    body: t.Object(
      {
        batasUtara: t.Optional(t.Unknown()),
        batasSelatan: t.Optional(t.Unknown()),
        batasTimur: t.Optional(t.Unknown()),
        batasBarat: t.Optional(t.Unknown()),
        luasWilayah: t.Optional(t.Unknown()),
        keterangan: t.Optional(t.Unknown()),
        petaEmbedUrl: t.Optional(t.Unknown()),
      },
      { additionalProperties: true },
    ),
  });

export default WilayahDesa;
