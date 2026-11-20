import Elysia, { t } from "elysia";
import lembagaKomunitasCreate from "./create";
import lembagaKomunitasDelete from "./del";
import lembagaKomunitasFindById from "./find-by-id";
import lembagaKomunitasFindMany from "./find-many";
import lembagaKomunitasJenis from "./jenis";
import lembagaKomunitasUpdate from "./updt";

// Tipe dasar saja; aturan isi (teks polos, panjang, bentuk kontak, urutan, foto gambar) divalidasi di
// parseLembagaKomunitasInput supaya pesan galat seragam.
const lembagaKomunitasBody = t.Object({
  nama: t.String(),
  jenis: t.String(),
  deskripsi: t.Optional(t.Union([t.String(), t.Null()])),
  ketua: t.Optional(t.Union([t.String(), t.Null()])),
  kontak: t.Optional(t.Union([t.String(), t.Null()])),
  urutan: t.Optional(t.Number()),
  fotoId: t.Optional(t.Union([t.String(), t.Null()])),
});

/** Lembaga & Komunitas desa (PPL, STT, PKK, dll). GET publik; mutasi admin-only di handler. */
const LembagaKomunitas = new Elysia({ prefix: "/lembagakomunitas", tags: ["Desa/Lembaga & Komunitas"] })
  .get("/find-many", lembagaKomunitasFindMany)
  .get("/jenis", lembagaKomunitasJenis)
  .get("/:id", lembagaKomunitasFindById)
  .post("/create", lembagaKomunitasCreate, { body: lembagaKomunitasBody })
  .put("/updt/:id", lembagaKomunitasUpdate, { body: lembagaKomunitasBody })
  .delete("/del/:id", lembagaKomunitasDelete);

export default LembagaKomunitas;
