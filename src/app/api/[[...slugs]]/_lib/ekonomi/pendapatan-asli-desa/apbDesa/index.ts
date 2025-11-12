import Elysia, { t } from "elysia";
import apbDesaFindMany from "./findMany";
import apbDesaFindUnique from "./findUnique";
import apbDesaCreate from "./create";
import apbDesaDelete from "./del";
import apbDesaUpdate from "./updt";
import apbDesaFindFirst from "./findFirst";

const APBDesa = new Elysia({
  prefix: "/apbdesa",
  tags: ["Ekonomi/Pendapatan Asli Desa/APB Desa"],
})
  .get("/find-many", apbDesaFindMany)
  .get("/find-first", apbDesaFindFirst)
  .get("/:id", async (context) => {
    const response = await apbDesaFindUnique(new Request(context.request));
    return response;
  })
  .post("/create", apbDesaCreate, {
    body: t.Object({
      tahun: t.Number(),
      pendapatanIds: t.Array(t.String()),
      belanjaIds: t.Array(t.String()),
      pembiayaanIds: t.Array(t.String()),
    }),
  })
  .delete("/del/:id", apbDesaDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await apbDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        tahun: t.Number(),
        pendapatanIds: t.Array(t.String()),
        belanjaIds: t.Array(t.String()),
        pembiayaanIds: t.Array(t.String()),
      }),
    }
  );
export default APBDesa;
