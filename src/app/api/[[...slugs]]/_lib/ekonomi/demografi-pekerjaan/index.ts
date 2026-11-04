import Elysia, { t } from "elysia";
import demografiPekerjaanFindUnique from "./findUnique";
import demografiPekerjaanUpdate from "./updt";
import demografiPekerjaanFindMany from "./findMany";
import demografiPekerjaanCreate from "./create";
import demografiPekerjaanDelete from "./del";

const DemografiPekerjaan = new Elysia({
    prefix: "/demografipekerjaan",
    tags: ["Ekonomi/Demografi Pekerjaan"],
})
.get("/:id", async (context) => {
    const response = await demografiPekerjaanFindUnique(context.request)
    return response
  })
  .get("/find-many", demografiPekerjaanFindMany)
  .post("/create", demografiPekerjaanCreate, {
    body: t.Object({
      pekerjaan: t.String(),
      lakiLaki: t.Number(),
      perempuan: t.Number(),
    }),
  })
  .put("/:id", demografiPekerjaanUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      pekerjaan: t.String(),
      lakiLaki: t.Number(),
      perempuan: t.Number(),
    }),
  })
  .delete("/del/:id", demografiPekerjaanDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default DemografiPekerjaan;