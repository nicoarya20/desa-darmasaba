import Elysia, { t } from "elysia";
import grafikBerdasarkanJenisKelaminCreate from "./create";
import grafikBerdasarkanJenisKelaminFindMany from "./find-many";
import grafikBerdasarakanJenisKelaminFindById from "./find-by-id";
import grafikBerdasarakanJenisKelaminUpdate from "./update";
import grafikBerdasarkanJenisKelaminDelete from "./del";


const GrafikBerdasarkanJenisKelamin = new Elysia({
  prefix: "/grafikberdasarkanjeniskelamin",
  tags: ["PPID/IKM/grafikberdasarkanjeniskelamin"],
})
  .get("/find-many", grafikBerdasarkanJenisKelaminFindMany)
  .get("/:id", async (context) => {
      const response = await grafikBerdasarakanJenisKelaminFindById(context.request)
      return response
    })
  .put("/:id", grafikBerdasarakanJenisKelaminUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      perempuan: t.String(),
      laki: t.String(),
    }),
  })
  .post("/create", grafikBerdasarkanJenisKelaminCreate, {
    body: t.Object({
      perempuan: t.String(),
      laki: t.String(),
    }),
  })
  .delete("/del/:id", grafikBerdasarkanJenisKelaminDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });
export default GrafikBerdasarkanJenisKelamin;
