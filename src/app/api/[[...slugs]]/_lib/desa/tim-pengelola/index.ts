import Elysia, { t } from "elysia";
import timPengelolaFind from "./find";
import timPengelolaFindAdmin from "./find-admin";
import timPengelolaUpsert from "./upsert";

// Body sengaja longgar (t.Unknown): aturan isi divalidasi zod di handler (parseTimPengelolaInput) supaya semua galat 400
// berbentuk { success: false, message } seperti modul lain.
const timPengelolaBody = t.Object(
  {
    nomorSk: t.Optional(t.Unknown()),
    tanggalSk: t.Optional(t.Unknown()),
    skFileId: t.Optional(t.Unknown()),
    anggota: t.Optional(t.Unknown()),
  },
  { additionalProperties: true },
);

/**
 * Tim Pengelola Website (singleton). GET publik hanya nomor SK + tautan PDF (TANPA anggota); GET /admin dan PUT admin-only
 * di handler (guardAdmin).
 */
const TimPengelola = new Elysia({ prefix: "/timpengelola", tags: ["Desa/Tim Pengelola"] })
  .get("/", timPengelolaFind)
  .get("/admin", timPengelolaFindAdmin)
  .put("/", timPengelolaUpsert, { body: timPengelolaBody });

export default TimPengelola;
