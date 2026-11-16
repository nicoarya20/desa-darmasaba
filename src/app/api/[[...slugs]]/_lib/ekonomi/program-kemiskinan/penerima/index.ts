import Elysia, { t } from "elysia";
import { IMPOR_MAKS_BARIS } from "@/lib/program-kemiskinan/penerima.rules";
import penerimaAdminFindMany from "./admin-find-many";
import penerimaCreate from "./create";
import penerimaDelete from "./del";
import penerimaImport from "./import";
import penerimaUpdate from "./updt";

// Bentuk dasar saja di sini; aturan isi (trim, panjang, tahun masuk akal) di penerima.body.ts.
const bodyPenerima = { tahun: t.Number(), nama: t.String(), alamat: t.String() };

/** API admin penerima Program Kemiskinan (`/ekonomi/programkemiskinan/penerima`), semua butuh role admin. */
const PenerimaProgramKemiskinan = new Elysia({
  prefix: "/penerima",
  tags: ["Ekonomi / Program Kemiskinan"],
})
  .get("/admin", penerimaAdminFindMany, {
    query: t.Object({
      programId: t.String(),
      tahun: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
    }),
  })
  .post("/create", penerimaCreate, { body: t.Object({ programId: t.String(), ...bodyPenerima }) })
  .post("/import", penerimaImport, {
    body: t.Object({
      programId: t.String(),
      tahun: t.Number(),
      mode: t.Union([t.Literal("tambah"), t.Literal("ganti")]),
      rows: t.Array(t.Object({ nama: t.String(), alamat: t.String() }), { maxItems: IMPOR_MAKS_BARIS }),
    }),
  })
  .put("/:id", penerimaUpdate, { body: t.Object({ ...bodyPenerima, isActive: t.Optional(t.Boolean()) }) })
  .delete("/del/:id", penerimaDelete);

export default PenerimaProgramKemiskinan;
