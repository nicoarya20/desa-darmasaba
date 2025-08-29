import Elysia, { t } from "elysia";
import pengelolaanSampahCreate from "./create";
import pengelolaanSampahDelete from "./del";
import pengelolaanSampahFindMany from "./findMany";
import pengelolaanSampahFindUnique from "./findUnique";
import pengelolaanSampahUpdate from "./updt";

const PengelolaanSampah = new Elysia({
  prefix: "/pengelolaansampah",
  tags: ["Lingkungan/Pengelolaan Sampah"],
})
  .get("/find-many", pengelolaanSampahFindMany)
  .get("/:id", async (context) => {
    const response = await pengelolaanSampahFindUnique(context);
    return response;
  })
  .post("/create", pengelolaanSampahCreate, {
    body: t.Object({
      name: t.String(),
      icon: t.String(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await pengelolaanSampahUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        icon: t.String(),
      }),
    }
  )
  .delete("/del/:id", pengelolaanSampahDelete)
export default PengelolaanSampah;
