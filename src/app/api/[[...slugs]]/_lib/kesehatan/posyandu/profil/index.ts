import Elysia, { t } from "elysia";
import profilPosyanduFind from "./find";
import profilPosyanduUpsert from "./upsert";

// Bentuk dasar saja; isi (wajib, panjang, sasaran) divalidasi `profilPosyanduBodySchema` agar pesan 400 jelas.
const teksOpsional = t.Optional(t.Nullable(t.String()));
const klasterBody = t.Object({
  sasaran: t.String(),
  judul: t.String(),
  deskripsi: t.String(),
  jamPelayanan: teksOpsional,
  imageId: teksOpsional,
});

/** Rute `/profil` (deskripsi umum + klaster) di bawah modul posyandu. */
const ProfilPosyandu = new Elysia({ prefix: "/profil" })
  .get("/", profilPosyanduFind)
  .put("/", profilPosyanduUpsert, {
    body: t.Object({
      deskripsi: t.String(),
      fungsiKegiatan: teksOpsional,
      klaster: t.Optional(t.Array(klasterBody)),
    }),
  });

export default ProfilPosyandu;
