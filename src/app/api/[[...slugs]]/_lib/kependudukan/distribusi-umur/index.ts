import Elysia, { t } from "elysia";
import distribusiUmurFindUnique from "./findUnique";
import distribusiUmurUpdate from "./updt";
import distribusiUmurFindMany from "./findMany";
import distribusiUmurCreate from "./create";
import distribusiUmurDelete from "./del";

const DistribusiUmur = new Elysia({
    prefix: "/distribusiumur",
    tags: ["Kependudukan/Distribusi Umur"],
})
.get("/:id", async (context) => {
    const response = await distribusiUmurFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", distribusiUmurFindMany)
  .post("/create", distribusiUmurCreate, {
    body: t.Object({
      rentangUmur: t.String(),
      jumlah: t.Number(),
      tahun: t.Number(),
    }),
  })
  .put("/:id", distribusiUmurUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      rentangUmur: t.String(),
      jumlah: t.Number(),
      tahun: t.Number(),
    }),
  })
  .delete("/del/:id", distribusiUmurDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default DistribusiUmur;
