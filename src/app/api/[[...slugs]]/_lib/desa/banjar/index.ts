import Elysia, { t } from "elysia";
import banjarCreate from "./create";
import banjarDelete from "./del";
import banjarFindMany from "./findMany";
import banjarFindUnique from "./findUnique";
import banjarUpdate from "./updt";

const Banjar = new Elysia({
  prefix: "/banjar",
  tags: ["Desa / Banjar"],
})
  .post("/create", banjarCreate, {
    body: t.Object({ name: t.String() }),
  })
  .get("/findMany", banjarFindMany)
  .get("/:id", banjarFindUnique)
  .put("/:id", banjarUpdate, {
    body: t.Object({ name: t.String() }),
  })
  .delete("/del/:id", banjarDelete);

export default Banjar;
