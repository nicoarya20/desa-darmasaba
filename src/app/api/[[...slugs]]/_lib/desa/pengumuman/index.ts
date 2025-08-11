import Elysia, { t } from "elysia";
import { pengumumanCreate } from "./create";
import pengumumanDelete from "./del";
import pengumumanFindById from "./find-by-id";
import pengumumanFindMany from "./find-many";
import pengumumanFindFirst from "./findFirst";
import pengumumanFindRecent from "./findRecent";
import pengumumanUpdate from "./updt";

const Pengumuman = new Elysia({ prefix: "/pengumuman", tags: ["Desa/Pengumuman"] })
  .get("/find-many", pengumumanFindMany)
  .get("/:id", pengumumanFindById)
  .delete("/del/:id", pengumumanDelete)
  .post("/create", pengumumanCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      content: t.String(),
      categoryPengumumanId: t.Union([t.String(), t.Null()]),
    }),
  })
  .get("/find-first", pengumumanFindFirst)
  .get("/find-recent", pengumumanFindRecent)
  .put("/:id", pengumumanUpdate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      content: t.String(),
      categoryPengumumanId: t.Union([t.String(), t.Null()]),
    }),
  });

export default Pengumuman;  