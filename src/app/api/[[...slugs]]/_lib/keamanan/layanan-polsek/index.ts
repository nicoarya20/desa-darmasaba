import Elysia from "elysia";
import layananPolsekCreate from "./create";
import layananPolsekFindMany from "./findMany";
import { t } from "elysia";
import layananPolsekUpdate from "./updt";
import layananPolsekFindUnique from "./findUnique";
import { layananPolsekDelete } from "./del";

const LayananPolsek = new Elysia({
  prefix: "/layanan-polsek",
  tags: ["Keamanan/Polsek Terdekat/Layanan Polsek"],
})
  .get("/find-many", layananPolsekFindMany)
  .get("/:id", async (context) => {
    const response = await layananPolsekFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .delete("/del/:id", layananPolsekDelete)
  .post("/create", layananPolsekCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .put("/:id", layananPolsekUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  });

export default LayananPolsek;
