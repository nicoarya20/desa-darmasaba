import Elysia, { t } from "elysia";
import balitaCreate from "./create";
import balitaDelete from "./del";
import balitaFindById from "./find-by-id";
import balitaFindMany from "./find-many";
import balitaUpdate from "./updt";

const Balita = new Elysia({ prefix: "/balita", tags: ["Kesehatan/Balita"] })
  .post("/create", balitaCreate, {
    body: t.Object({
      nama: t.String(),
      nik: t.Optional(t.String()),
      tanggalLahir: t.String(),
      jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
      beratBadanKg: t.Optional(t.Number()),
      tinggiBadanCm: t.Optional(t.Number()),
      namaOrtu: t.Optional(t.String()),
      alamat: t.Optional(t.String()),
      noHpOrtu: t.Optional(t.String()),
      posyanduId: t.Optional(t.String()),
      imunisasiLengkap: t.Boolean(),
      giziBaik: t.Boolean(),
      pemeriksaanRutin: t.Boolean(),
      statusStunting: t.Union([
        t.Literal("NORMAL"),
        t.Literal("ALERT"),
        t.Literal("STUNTING"),
      ]),
      catatan: t.Optional(t.String()),
    }),
  })
  .get("/find-many", balitaFindMany)
  .delete("/del/:id", balitaDelete)
  .get("/:id", balitaFindById)
  .put(
    "/:id",
    balitaUpdate,
    {
      body: t.Object({
        nama: t.String(),
        nik: t.Optional(t.String()),
        tanggalLahir: t.String(),
        jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
        beratBadanKg: t.Optional(t.Number()),
        tinggiBadanCm: t.Optional(t.Number()),
        namaOrtu: t.Optional(t.String()),
        alamat: t.Optional(t.String()),
        noHpOrtu: t.Optional(t.String()),
        posyanduId: t.Optional(t.String()),
        imunisasiLengkap: t.Boolean(),
        giziBaik: t.Boolean(),
        pemeriksaanRutin: t.Boolean(),
        statusStunting: t.Union([
          t.Literal("NORMAL"),
          t.Literal("ALERT"),
          t.Literal("STUNTING"),
        ]),
        catatan: t.Optional(t.String()),
      }),
    }
  );

export default Balita;
