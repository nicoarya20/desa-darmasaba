import Elysia, { t } from "elysia";
import PengajarCreate from "./create";
import PengajarDelete from "./del";
import PengajarFindMany from "./findMany";
import PengajarFindUnique from "./findUnique";
import PengajarUpdate from "./updt";

const Pengajar = new Elysia({
  prefix: "/pengajar",
  tags: ["Pendidikan/Info Sekolah PAUD/Pengajar"],
})

  // ✅ Find all
  .get("/find-many", PengajarFindMany)

  // ✅ Find by ID
  .get("/:id", PengajarFindUnique)

  // ✅ Create
  .post("/create", PengajarCreate, {
    body: t.Object({
      nama: t.String(),
      lembagaId: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", PengajarUpdate, {
    body: t.Object({
      nama: t.Optional(t.String()),
      lembagaId: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", PengajarDelete);

export default Pengajar;
