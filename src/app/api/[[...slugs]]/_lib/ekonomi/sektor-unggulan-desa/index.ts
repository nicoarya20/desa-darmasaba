import Elysia, { t } from "elysia";
import sektorUnggulanDesaFindMany from "./findMany";
import sektorUnggulanDesaFindUnique from "./findUnique";
import sektorUnggulanDesaCreate from "./create";
import sektorUnggulanDesaUpdate from "./updt";
import sektorUnggulanDesaDelete from "./del";

const SektorUnggulanDesa = new Elysia({
  prefix: "/sektourunggulandesa",
  tags: ["Ekonomi/Sektor Unggulan Desa"],
})
  .get("/find-many", sektorUnggulanDesaFindMany)
  .get("/:id", async (context) => {
    const response = await sektorUnggulanDesaFindUnique(context.request);
    return response;
  })
  .post("/create", sektorUnggulanDesaCreate, {
    body: t.Object({
      name: t.String(),
      description: t.String(),
      value: t.Number(),
      satuan: t.Optional(t.Nullable(t.String())),
      periode: t.Optional(t.Nullable(t.String())),
    }),
  })
  .put("/:id", sektorUnggulanDesaUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.String(),
      description: t.String(),
      value: t.Number(),
      satuan: t.Optional(t.Nullable(t.String())),
      periode: t.Optional(t.Nullable(t.String())),
    }),
  })
  .delete("/del/:id", sektorUnggulanDesaDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });
export default SektorUnggulanDesa;
