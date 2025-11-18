// src/app/api/[[...slugs]]/_lib/landing_page/apbdes/index.ts
import Elysia, { t } from "elysia";
import apbdesCreate from "./create";
import apbdesDelete from "./del";
import apbdesFindMany from "./findMany";
import apbdesFindUnique from "./findUnique";
import apbdesUpdate from "./updt";

// Definisikan skema untuk item APBDes
const ApbdesItemSchema = t.Object({
  kode: t.String(),
  uraian: t.String(),
  anggaran: t.Number(),
  realisasi: t.Number(),
  selisih: t.Number(),
  persentase: t.Number(),
  level: t.Number(),
  tipe: t.Optional(t.Union([t.String(), t.Null()])) // misal: "pendapatan" atau "belanja"
});

const APBDes = new Elysia({
  prefix: "/apbdes",
  tags: ["Landing Page/Profile/APB Des"],
})

  // ✅ Find all (dengan query opsional: page, limit, tahun)
  .get("/findMany", apbdesFindMany)

  // ✅ Find by ID
  .get("/:id", apbdesFindUnique)

  // ✅ Create
  .post("/create", apbdesCreate, {
    body: t.Object({
      tahun: t.Number(),
      imageId: t.String(),
      fileId: t.String(),
      items: t.Array(ApbdesItemSchema),
    }),
  })

  // ✅ Update
  .put("/:id", apbdesUpdate, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      tahun: t.Number(),
      imageId: t.String(),
      fileId: t.String(),
      items: t.Array(ApbdesItemSchema),
    }),
  })

  // ✅ Delete
  .delete("/del/:id", apbdesDelete, {
    params: t.Object({ id: t.String() }),
  });

export default APBDes;