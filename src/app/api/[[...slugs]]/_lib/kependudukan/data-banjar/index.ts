import Elysia, { t } from "elysia";
import dataBanjarFindUnique from "./findUnique";
import dataBanjarUpdate from "./updt";
import dataBanjarFindMany from "./findMany";
import dataBanjarCreate from "./create";
import dataBanjarDelete from "./del";

const DataBanjar = new Elysia({
    prefix: "/databanjar",
    tags: ["Kependudukan/Data Banjar"],
})
.get("/:id", async (context) => {
    const response = await dataBanjarFindUnique(context.request)
    return response
  })
  .get("/find-many", dataBanjarFindMany)
  .post("/create", dataBanjarCreate, {
    body: t.Object({
      nama: t.String(),
      penduduk: t.Number(),
      kk: t.Number(),
      miskin: t.Number(),
      tahun: t.Number(),
    }),
  })
  .put("/:id", dataBanjarUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      nama: t.String(),
      penduduk: t.Number(),
      kk: t.Number(),
      miskin: t.Number(),
      tahun: t.Number(),
    }),
  })
  .delete("/del/:id", dataBanjarDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default DataBanjar;
