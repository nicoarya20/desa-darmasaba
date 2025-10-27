import Elysia, { t } from "elysia";
import apbdesCreate from "./create";
import apbdesDelete from "./del";
import apbdesFindMany from "./findMany";
import apbdesFindUnique from "./findUnique";
import apbdesUpdate from "./updt";

const APBDes = new Elysia({
  prefix: "/apbdes",
  tags: ["Landing Page/Profile/APB Des"],
})

  // ✅ Find all
  .get("/findMany", apbdesFindMany)

  // ✅ Find by ID
  .get("/:id", apbdesFindUnique)

  // ✅ Create
  .post("/create", apbdesCreate, {
    body: t.Object({
      name: t.String(),
      imageId: t.String(),
      fileId: t.String(),
      jumlah: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", apbdesUpdate, {
    body: t.Object({
      name: t.String(),
      imageId: t.Optional(t.String()),
      fileId: t.Optional(t.String()),
      jumlah: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", apbdesDelete);

export default APBDes;
