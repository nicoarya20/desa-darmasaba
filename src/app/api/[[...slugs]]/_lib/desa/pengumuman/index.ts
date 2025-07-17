import Elysia from "elysia";
import { pengumumanCreate } from "./create";
import pengumumanFindMany from "./find-many";
import { t } from "elysia";
import pengumumanCategoryFindMany from "./category";
import pengumumanDelete from "./del";
import pengumumanFindById from "./find-by-id";
import pengumumanUpdate from "./updt";
import pengumumanFindFirst from "./findFirst";
import pengumumanFindRecent from "./findRecent";

const Pengumuman = new Elysia({ prefix: "/pengumuman", tags: ["Desa/Pengumuman"] })
  .get("/category/find-many", pengumumanCategoryFindMany)
  .get("/find-many", pengumumanFindMany)
  .get("/:id", pengumumanFindById)
  .delete("/delete/:id", pengumumanDelete)
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
      id: t.String(),
      judul: t.String(),
      deskripsi: t.String(),
      content: t.String(),
      categoryPengumumanId: t.Union([t.String(), t.Null()]),
    }),
  });

export default Pengumuman;  