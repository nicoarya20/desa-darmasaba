import Elysia, { t } from "elysia";
import umkmCreate from "./create";
import umkmDelete from "./del";
import umkmFindMany from "./findMany";
import umkmFindManyAll from "./findManyAll";
import umkmFindUnique from "./findUnique";
import umkmUpdate from "./updt";

const Umkm = new Elysia({
  prefix: "/umkm",
  tags: ["Ekonomi/UMKM"],
})
  .get("/find-many", umkmFindMany)
  .get("/find-many-all", umkmFindManyAll)
  .get("/:id", umkmFindUnique, {
    params: t.Object({
      id: t.String(),
    }),
  })
  .post("/create", umkmCreate, {
    body: t.Object({
      nama: t.String(),
      pemilik: t.String(),
      kategoriId: t.String(),
      deskripsi: t.Optional(t.String()),
      alamat: t.Optional(t.String()),
      kontak: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .put("/:id", umkmUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      nama: t.String(),
      pemilik: t.String(),
      kategoriId: t.String(),
      deskripsi: t.Optional(t.String()),
      alamat: t.Optional(t.String()),
      kontak: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      isActive: t.Boolean(),
    }),
  })
  .delete("/del/:id", umkmDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default Umkm;
