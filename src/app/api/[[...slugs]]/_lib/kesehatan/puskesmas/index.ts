import Elysia, { t } from "elysia";
import puskesmasCreate from "./create";
import puskesmasDelete from "./del";
import puskesmasFindMany from "./find-many";
import findUniquePuskesmas from "./findUnique";
import PustuDaftarAnak from "./pustu.anak";
import puskesmasUpdate from "./updt";

// Bentuk kasar body; isi divalidasi skema zod `pustuBodySchema` (src/lib/pustu/pustu.validation.ts).
const teksOpsional = t.Optional(t.Nullable(t.String()));
const pustuBody = t.Object({
  name: t.String(),
  alamat: t.String(),
  imageId: teksOpsional,
  jadwal: t.Optional(t.Nullable(t.Array(t.Object({ hari: t.String(), jam: t.String() })))),
  kontak: t.Optional(t.Object({ kontakPuskesmas: teksOpsional, email: teksOpsional, kontakUGD: teksOpsional })),
  mediaSosial: t.Optional(t.Nullable(t.Array(t.Object({ platform: t.String(), url: t.String() })))),
  layananUnggulan: t.Optional(t.Nullable(t.Array(t.Object({ judul: t.String(), deskripsi: teksOpsional })))),
  linkPetunjukArah: teksOpsional,
  prosedurPendaftaran: teksOpsional,
  tarifBpjs: teksOpsional,
  tarifUmum: teksOpsional,
  fotoBaganStrukturId: teksOpsional,
});

/** Modul API PUSTU (Puskesmas Pembantu); prefix `puskesmas` dipertahankan sebagai kontrak URL. */
const Puskesmas = new Elysia({
  prefix: "puskesmas",
  tags: ["Kesehatan/Puskesmas"],
})
  .post("/create", puskesmasCreate, { body: pustuBody })
  .get("/find-many", puskesmasFindMany)
  .delete("/del/:id", puskesmasDelete)
  .get("/:id", findUniquePuskesmas)
  .put("/:id", puskesmasUpdate, { body: pustuBody })
  .use(PustuDaftarAnak);

export default Puskesmas;
