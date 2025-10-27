import Elysia, { t } from "elysia";
import lembagaPendidikanCreate from "./create";
import lembagaPendidikanDelete from "./del";
import lembagaPendidikanFindMany from "./findMany";
import lembagaPendidikanFindUnique from "./findUnique";
import lembagaPendidikanUpdate from "./updt";

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
    }),
  })

  // ✅ Update
  .put("/:id", lembagaPendidikanUpdate, {
    body: t.Object({
      nama: t.Optional(t.String()),
      jenjangId: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", lembagaPendidikanDelete);

export default LembagaPendidikan;
