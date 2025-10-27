import Elysia, { t } from "elysia";
import kolaborasiInovasiFindMany from "./findMany";
import kolaborasiInovasiFindUnique from "./findUnique";
import kolaborasiInovasiCreate from "./create";
import kolaborasiInovasiUpdate from "./updt";
import kolaborasiInovasiDelete from "./del";

const KolaborasiInovasi = new Elysia({
  prefix: "/kolaborasiinovasi",
  tags: ["Inovasi/Kolaborasi Inovasi"],
})
  .get("/find-many", kolaborasiInovasiFindMany)
  .get("/:id", async (context) => {
    const response = await kolaborasiInovasiFindUnique(context);
    return response;
  })
  .post("/create", kolaborasiInovasiCreate, {
    body: t.Object({
      name: t.String(),
      tahun: t.Number(),
      slug: t.String(),
      deskripsi: t.String(),
      kolaborator: t.String(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await kolaborasiInovasiUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        tahun: t.Number(),
        slug: t.String(),
        deskripsi: t.String(),
        kolaborator: t.String(),

      }),
    }
  )
  .delete("/del/:id", kolaborasiInovasiDelete);
export default KolaborasiInovasi;
