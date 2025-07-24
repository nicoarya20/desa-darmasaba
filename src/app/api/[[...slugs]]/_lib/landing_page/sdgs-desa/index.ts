import Elysia, { t } from "elysia";
import sdgsDesaCreate from "./create";
import sdgsDesaDelete from "./del";
import sdgsDesaFindMany from "./findMany";
import sdgsDesaFindUnique from "./findUnique";
import sdgsDesaUpdate from "./updt";

const SDGSDesa = new Elysia({
  prefix: "/sdgsdesa",
  tags: ["Landing Page/Profile/SDGS Desa"],
})

  // ✅ Find all
  .get("/find-many", sdgsDesaFindMany)

  // ✅ Find by ID
  .get("/:id", sdgsDesaFindUnique)

  // ✅ Create
  .post("/create", sdgsDesaCreate, {
    body: t.Object({
      name: t.String(),
      imageId: t.String(),
      jumlah: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", sdgsDesaUpdate, {
    body: t.Object({
      name: t.String(),
      imageId: t.Optional(t.String()),
      jumlah: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", sdgsDesaDelete);

export default SDGSDesa;
