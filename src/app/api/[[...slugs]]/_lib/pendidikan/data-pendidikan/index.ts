import Elysia, { t } from "elysia";
import dataPendidikanFindMany from "./findMany";
import dataPendidikanFindUnique from "./findUnique";
import dataPendidikanUpdate from "./updt";
import dataPendidikanCreate from "./create";
import dataPendidikanDelete from "./del";

const DataPendidikan = new Elysia({
  prefix: "/datapendidikan",
  tags: ["Pendidikan/Data Pendidikan"],
})
  .get("/findMany", dataPendidikanFindMany)
  .get("/:id", async (context) => {
    const response = await dataPendidikanFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", dataPendidikanUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.String(),
      jumlah: t.String(),
    }),
  })
  .post("/create", dataPendidikanCreate, {
    body: t.Object({
      name: t.String(),
      jumlah: t.String(),
    }),
  })
  .delete("/del/:id", dataPendidikanDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });
export default DataPendidikan;
