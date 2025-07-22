import Elysia, { t } from "elysia";
import ProgramInovasiCreate from "./create";
import ProgramInovasiDelete from "./del";
import ProgramInovasiFindMany from "./findMany";
import ProgramInovasiFindUnique from "./findUnique";
import ProgramInovasiUpdate from "./updt";

const ProgramInovasi = new Elysia({
  prefix: "/programinovasi",
  tags: ["Landing Page/Profile/Program Inovasi"],
})

  // ✅ Find all
  .get("/find-many", ProgramInovasiFindMany)

  // ✅ Find by ID
  .get("/:id", ProgramInovasiFindUnique)

  // ✅ Create
  .post("/create", ProgramInovasiCreate, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      imageId: t.String(),
      link: t.String(),
    }),
  })

  // ✅ Update
  .put("/:id", ProgramInovasiUpdate, {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      imageId: t.Optional(t.String()),
      link: t.Optional(t.String()),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", ProgramInovasiDelete);

export default ProgramInovasi;
