import Elysia, { t } from "elysia";
import responseStatCreate from "./create";
import responseStatDelete from "./del";
import responseStatFindMany from "./findMany";
import responseStatFindUnique from "./findUnique";
import responseStatUpdate from "./updt";


const response = new Elysia({
  prefix: "/response",
  tags: ["Landing Page/Indeks Kepuasan Masyarakat/Response"],
})
  .post("/create", responseStatCreate, {
    body: t.Object({
      monthlyStatId: t.String(),
      label: t.String(),
      count: t.Number(),
    }),
  })
  .get("/findMany", responseStatFindMany)
  .get("/:id", responseStatFindUnique)
  .put("/:id", responseStatUpdate, {
    body: t.Object({
      label: t.String(),
      count: t.Number(),
      monthlyStatId: t.String(),
    }),
  })
  .delete("/del/:id", responseStatDelete);

export default response;
