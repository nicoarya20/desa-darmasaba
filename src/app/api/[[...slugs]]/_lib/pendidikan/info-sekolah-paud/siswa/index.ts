import Elysia, { t } from "elysia";
import SiswaCreate from "./create";
import SiswaDelete from "./del";
import SiswaFindMany from "./findMany";
import SiswaFindUnique from "./findUnique";
import SiswaUpdate from "./updt";

const Siswa = new Elysia({
  prefix: "/siswa",
  tags: ["Pendidikan/Info Sekolah PAUD/Siswa"],
})

  // ✅ Find all
  .get("/find-many", SiswaFindMany)

  // ✅ Find by ID
  .get("/:id", SiswaFindUnique)

  // ✅ Create
  .post("/create", SiswaCreate, {
    body: t.Object({
      nama: t.String(),
      lembagaId: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", SiswaUpdate, {
    body: t.Object({
      nama: t.Optional(t.String()),
      lembagaId: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", SiswaDelete);

export default Siswa;
