import Elysia, { t } from "elysia";
import layananPolsekCreate from "./create";
import layananPolsekDelete from "./del";
import layananPolsekFindManyAll from "./findManyAll";
import layananPolsekFindUnique from "./findUnique";
import layananPolsekUpdate from "./updt";
import layananPolsekFindMany from "./findMany";

const LayananPolsek = new Elysia({
    prefix: "/layananpolsek",
    tags: ["layanan polsek"],
})

 .post("/create", layananPolsekCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
.get("/findMany", layananPolsekFindMany)
  .get("/findManyAll", layananPolsekFindManyAll)
  .get("/:id", async (context) => {
    const response = await layananPolsekFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", layananPolsekUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .delete("/del/:id", layananPolsekDelete);

export default LayananPolsek;