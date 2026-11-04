import Elysia, { t } from "elysia";
import distribusiAgamaFindUnique from "./findUnique";
import distribusiAgamaUpdate from "./updt";
import distribusiAgamaFindMany from "./findMany";
import distribusiAgamaCreate from "./create";
import distribusiAgamaDelete from "./del";

const DistribusiAgama = new Elysia({
    prefix: "/distribusiagama",
    tags: ["Kependudukan/Distribusi Agama"],
})
.get("/:id", async (context) => {
    const response = await distribusiAgamaFindUnique(context.request)
    return response
  })
  .get("/find-many", distribusiAgamaFindMany)
  .post("/create", distribusiAgamaCreate, {
    body: t.Object({
      agama: t.String(),
      jumlah: t.Number(),
      tahun: t.Number(),
    }),
  })
  .put("/:id", distribusiAgamaUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      agama: t.String(),
      jumlah: t.Number(),
      tahun: t.Number(),
    }),
  })
  .delete("/del/:id", distribusiAgamaDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default DistribusiAgama;
