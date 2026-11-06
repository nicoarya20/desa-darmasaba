import Elysia, { t } from "elysia";
import dokumenPerencanaanFindMany from "./find-many";
import dokumenPerencanaanFindUnique from "./findUnique";
import dokumenPerencanaanCreate from "./create";
import dokumenPerencanaanUpdate from "./updt";
import dokumenPerencanaanDelete from "./del";

// Tipe dasar saja; aturan per jenis (RPJM wajib periode, RKP wajib tahun, dst.)
// divalidasi di parseDokumenPerencanaanInput supaya pesan error seragam.
const dokumenBody = t.Object({
  jenis: t.String(),
  judul: t.String(),
  tahun: t.Optional(t.Union([t.Number(), t.Null()])),
  tahunMulai: t.Optional(t.Union([t.Number(), t.Null()])),
  tahunSelesai: t.Optional(t.Union([t.Number(), t.Null()])),
  nomorPerdes: t.Optional(t.Union([t.String(), t.Null()])),
  ringkasan: t.Optional(t.Union([t.String(), t.Null()])),
  jenisMusyawarah: t.Optional(t.Union([t.String(), t.Null()])),
  fileId: t.Optional(t.Union([t.String(), t.Null()])),
});

const DokumenPerencanaan = new Elysia({
  prefix: "/dokumenperencanaan",
  tags: ["Desa/Dokumen Perencanaan"],
})
  .get("/find-many", dokumenPerencanaanFindMany)
  .get("/:id", dokumenPerencanaanFindUnique)
  .post("/create", dokumenPerencanaanCreate, { body: dokumenBody })
  .put("/:id", dokumenPerencanaanUpdate, { body: dokumenBody })
  .delete("/del/:id", dokumenPerencanaanDelete);

export default DokumenPerencanaan;
