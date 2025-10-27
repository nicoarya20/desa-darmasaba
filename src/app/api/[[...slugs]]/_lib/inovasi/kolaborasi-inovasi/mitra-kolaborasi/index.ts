import Elysia, { t } from "elysia";
import mitraKolaborasiCreate from "./create";
import mitraKolaborasiDelete from "./del";
import mitraKolaborasiUpdate from "./updt";
import mitraKolaborasiFindUnique from "./findUnique";
import mitraKolaborasiFindMany from "./findMany";

const MitraKolaborasi = new Elysia({
  prefix: "/mitrakolaborasi",
  tags: ["Inovasi/Mitra Kolaborasi"],
})
  .post("/create", mitraKolaborasiCreate, {
    body: t.Object({
      name: t.String(),
      imageId: t.String(),
    }),
  })
  .get("/find-many", mitraKolaborasiFindMany)
  .get("/:id", async (context) => {
    const response = await mitraKolaborasiFindUnique(context.request);
    return response;
  })
  .delete("/del/:id", mitraKolaborasiDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await mitraKolaborasiUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        imageId: t.String(),
      }),
    }
  );
export default MitraKolaborasi;
