import Elysia, { t } from "elysia";
import prestasiDesaCreate from "./create";
import prestasiDesaDelete from "./del";
import prestasiDesaFindMany from "./findMany";
import prestasiDesaFindUnique from "./findUnique";
import prestasiDesaUpdate from "./updt";

const PrestasiDesa = new Elysia({
  prefix: "/prestasidesa",
  tags: ["Landing Page/Profile/Prestasi Desa"],
})

  // ✅ Find all
  .get("/find-many", prestasiDesaFindMany)

  // ✅ Find by ID
  .get("/:id", prestasiDesaFindUnique)

  // ✅ Create
  .post("/create", prestasiDesaCreate, {
    body: t.Object({
      name: t.String(),
      imageId: t.String(),
      deskripsi: t.String(),
      kategoriId: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", prestasiDesaUpdate, {
    body: t.Object({
      name: t.String(),
      imageId: t.Optional(t.String()),
      deskripsi: t.Optional(t.String()),
      kategoriId: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", prestasiDesaDelete);

export default PrestasiDesa;
