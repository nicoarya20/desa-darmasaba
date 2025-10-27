import Elysia, { t } from "elysia";
import jenjangPendidikanCreate from "./create";
import jenjangPendidikanDelete from "./del";
import jenjangPendidikanFindMany from "./findMany";
import jenjangPendidikanFindUnique from "./findUnique";
import jenjangPendidikanUpdate from "./updt";

const JenjangPendidikan = new Elysia({
  prefix: "/jenjangpendidikan",
  tags: ["Pendidikan/Jenjang Pendidikan"],
})
  .get("/find-many", jenjangPendidikanFindMany)
  .get("/:id", async (context) => {
    const response = await jenjangPendidikanFindUnique(context);
    return response;
  })
  .delete("/del/:id", jenjangPendidikanDelete)
  .post("/create", jenjangPendidikanCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .put("/:id", jenjangPendidikanUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  });

export default JenjangPendidikan;
