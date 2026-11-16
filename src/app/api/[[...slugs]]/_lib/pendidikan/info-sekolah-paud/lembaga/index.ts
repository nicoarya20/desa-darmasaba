import Elysia, { t } from "elysia";
import lembagaPendidikanCreate from "./create";
import lembagaPendidikanDelete from "./del";
import lembagaPendidikanFindMany from "./findMany";
import lembagaPendidikanFindUnique from "./findUnique";
import lembagaPendidikanUpdate from "./updt";
import LembagaDaftarAnak from "./lembaga.anak";

// Body TypeBox hanya menjaga bentuk kasar; aturan isi ada di skema zod `lembaga.validation.ts`.
// Field detail sekolah additive & opsional (body lama { nama, jenjangId } tetap diterima).
const teksOpsional = t.Optional(t.Nullable(t.String()));
const angkaOpsional = t.Optional(t.Nullable(t.Number()));
const detailBody = {
  deskripsi: teksOpsional,
  alamat: teksOpsional,
  kontak: teksOpsional,
  mediaSosial: t.Optional(t.Nullable(t.Array(t.Object({ platform: t.String(), url: t.String() })))),
  lat: angkaOpsional,
  lng: angkaOpsional,
  linkGoogleMaps: teksOpsional,
  fotoSekolahId: teksOpsional,
  fotoBaganStrukturId: teksOpsional,
};

const LembagaPendidikan = new Elysia({
  prefix: "/lembagapendidikan",
  tags: ["Pendidikan/Info Sekolah PAUD/Lembaga Pendidikan"],
})

  // ✅ Find all
  .get("/find-many", lembagaPendidikanFindMany)

  // ✅ Find by ID
  .get("/:id", lembagaPendidikanFindUnique)

  // ✅ Create
  .post("/create", lembagaPendidikanCreate, {
    body: t.Object({
      nama: t.String(),
      jenjangId: t.String(),
      ...detailBody,
    }),
  })

  // ✅ Update
  .put("/:id", lembagaPendidikanUpdate, {
    body: t.Object({
      nama: t.Optional(t.String()),
      jenjangId: t.Optional(t.String()),
      ...detailBody,
    }),
  })
  // ✅ Delete
  .delete("/del/:id", lembagaPendidikanDelete)
  .use(LembagaDaftarAnak);

export default LembagaPendidikan;
