import Elysia, { t } from "elysia";
import fotoProfilCreate from "./create";
import fotoProfilDelete from "./del";
import fotoProfilFindMany from "./findMany";
import fotoProfilReorder from "./reorder";
import fotoProfilUpdate from "./updt";

const keterangan = t.Optional(t.Nullable(t.String()));

/** Galeri foto Profil BUMDes: GET publik, mutasi lewat guard admin global di route.ts. */
const FotoProfilBumDes = new Elysia({
  prefix: "/foto",
  tags: ["Ekonomi/BUMDes/Profil/Galeri"],
})
  .get("/", fotoProfilFindMany)
  .post("/", fotoProfilCreate, {
    body: t.Object({ items: t.Array(t.Object({ imageId: t.String(), keterangan })) }),
  })
  .put("/urutan", fotoProfilReorder, {
    body: t.Object({ ids: t.Array(t.String()) }),
  })
  .put("/:id", fotoProfilUpdate, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ keterangan }),
  })
  .delete("/:id", fotoProfilDelete, {
    params: t.Object({ id: t.String() }),
  });

export default FotoProfilBumDes;
