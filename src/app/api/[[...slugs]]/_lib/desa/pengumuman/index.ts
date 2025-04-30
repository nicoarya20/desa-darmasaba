import Elysia from "elysia";
import { pengumumanCreate } from "./create";
import pengumumanFindMany from "./find-many";
import { t } from "elysia";
import pengumumanCategoryFindMany from "./category";

const Pengumuman = new Elysia({ prefix: "/pengumuman", tags: ["Desa/Pengumuman"] })
  .get("/category/find-many", pengumumanCategoryFindMany)
  .get("/find-many", pengumumanFindMany)
  .post("/create", pengumumanCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      content: t.String(),
      categoryPengumumanId: t.Union([t.String(), t.Null()]),
    }),
  });

export default Pengumuman;  