import Elysia, { t } from "elysia";
import { grafikBerdasarkanUmurCreate } from "./create";
import grafikBerdasarakanUmurUpdate from "./update";
import grafikBerdasarakanUmurFindById from "./find-by-id";
import grafikBerdasarkanUmurDelete from "./del";
import grafikBerdasarkanUmurFindMany from "./find-many";

const GrafikBerdasarkanUmur = new Elysia({
  prefix: "/grafikberdasarkanumur",
  tags: ["PPID/IKM/grafikberdasarkanumur"],
})
  .get("/find-many", grafikBerdasarkanUmurFindMany)
  .post("/create", grafikBerdasarkanUmurCreate, {
    body: t.Object({
      remaja: t.String(),
      dewasa: t.String(),
      orangtua: t.String(),
      lansia: t.String(),
    }),
  })
  .get("/:id", async (context) => {
        const response = await grafikBerdasarakanUmurFindById(new Request(context.request))
        return response
      })
  .put("/:id", grafikBerdasarakanUmurUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      remaja: t.String(),
      dewasa: t.String(),
      orangtua: t.String(),
      lansia: t.String(),
    }),
  })
  .delete("/del/:id", grafikBerdasarkanUmurDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default GrafikBerdasarkanUmur;
