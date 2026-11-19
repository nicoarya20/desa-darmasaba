import Elysia, { t } from "elysia";
import indeksDesaCreate from "./create";
import indeksDesaDelete from "./del";
import indeksDesaFindById from "./find-by-id";
import indeksDesaFindMany from "./find-many";
import indeksDesaUpdate from "./updt";

// Tipe dasar saja; aturan isi (tahun sah, skor 0-1, status resmi, catatan teks polos) divalidasi di parseIndeksDesaInput
// supaya pesan galat seragam.
const indeksDesaBody = t.Object({
  tahun: t.Number(),
  skorIdm: t.Number(),
  skorIks: t.Number(),
  skorIke: t.Number(),
  skorIkl: t.Number(),
  status: t.String(),
  catatan: t.Optional(t.Union([t.String(), t.Null()])),
});

/** Indeks Desa Membangun (IDM) Desa Darmasaba, satu baris per tahun. GET publik; mutasi admin-only di handler. */
const IndeksDesa = new Elysia({ prefix: "/indeksdesa", tags: ["Desa/Indeks Desa"] })
  .get("/find-many", indeksDesaFindMany)
  .get("/:id", indeksDesaFindById)
  .post("/create", indeksDesaCreate, { body: indeksDesaBody })
  .put("/updt/:id", indeksDesaUpdate, { body: indeksDesaBody })
  .delete("/del/:id", indeksDesaDelete);

export default IndeksDesa;
