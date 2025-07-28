import Elysia, { t } from "elysia";
import ageStatCreate from "./create";
import ageStatDelete from "./del";
import ageStatFindMany from "./findMany";
import ageStatFindUnique from "./findUnique";
import ageStatUpdate from "./updt";


const age = new Elysia({
  prefix: "/age",
  tags: ["Landing Page/Indeks Kepuasan Masyarakat/Age"],
})
  .post("/create", ageStatCreate, {
    body: t.Object({
      monthlyStatId: t.String(),
      group: t.String(),
      count: t.Number(),
    }),
  })
  .get("/findMany", ageStatFindMany)
  .get("/:id", ageStatFindUnique)
  .put("/:id", ageStatUpdate, {
    body: t.Object({
      group: t.String(),
      count: t.Number(),
      monthlyStatId: t.String(),
    }),
  })
  .delete("/del/:id", ageStatDelete);

export default age;
