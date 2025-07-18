import Elysia, { t } from "elysia";
import dataLingkunganDesaFindMany from "./findMany";
import dataLingkunganDesaFindUnique from "./findUnique";
import dataLingkunganDesaCreate from "./create";
import dataLingkunganDesaUpdate from "./updt";
import dataLingkunganDesaDelete from "./del";

const DataLingkunganDesa = new Elysia({
  prefix: "/datalingkungandesa",
  tags: ["Lingkungan/Data Lingkungan Desa"],
})
  .get("/find-many", dataLingkunganDesaFindMany)
  .get("/:id", async (context) => {
    const response = await dataLingkunganDesaFindUnique(context);
    return response;
  })
  .post("/create", dataLingkunganDesaCreate, {
    body: t.Object({
      name: t.String(),
      jumlah: t.String(),
      deskripsi: t.String(),
      icon: t.String(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await dataLingkunganDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        jumlah: t.String(),
        deskripsi: t.String(),
        icon: t.String(),
      }),
    }
  )
  .delete("/del/:id", dataLingkunganDesaDelete);
  export default DataLingkunganDesa;
