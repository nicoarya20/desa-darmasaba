import Elysia, { t } from "elysia";
import pembiayaanFindMany from "./findMany";
import pembiayaanFindUnique from "./findUnique";
import pembiayaanCreate from "./create";
import pembiayaanDelete from "./del";
import pembiayaanUpdate from "./updt";

const Pembiayaan = new Elysia({
  prefix: "/pembiayaan",
  tags: ["Ekonomi/Pendapatan Asli Desa/Pembiayaan"],
})
  .get("/find-many", pembiayaanFindMany)
  .get("/:id", async (context) => {
    const response = await pembiayaanFindUnique(context.request);
    return response;
  })
  .post("/create", pembiayaanCreate, {
    body: t.Object({
      name: t.String(),
      value: t.Number(),
    }),
  })
  .delete("/delete/:id", pembiayaanDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await pembiayaanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        value: t.Number(),
      }),
    }
  );
export default Pembiayaan;
