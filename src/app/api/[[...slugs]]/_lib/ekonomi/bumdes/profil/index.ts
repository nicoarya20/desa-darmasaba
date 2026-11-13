import Elysia, { t } from "elysia";
import profilBumDesFind from "./find";
import profilBumDesUpsert from "./upsert";
import FotoProfilBumDes from "./foto";

const ProfilBumDes = new Elysia({
  prefix: "/profil",
  tags: ["Ekonomi/BUMDes/Profil"],
})
  .get("/", profilBumDesFind)
  .put("/", profilBumDesUpsert, {
    body: t.Object({
      nama: t.String(),
      deskripsi: t.String(),
      alamat: t.Optional(t.Nullable(t.String())),
      kontak: t.Optional(t.Nullable(t.String())),
      tahunBerdiri: t.Optional(t.Nullable(t.Number())),
      imageId: t.Optional(t.Nullable(t.String())),
    }),
  })
  .use(FotoProfilBumDes);

export default ProfilBumDes;
