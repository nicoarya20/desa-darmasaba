import Elysia, { t } from "elysia";
import penghargaanFindMany from "./find-many";
import penghargaanFindUnique from "./findUnique";
import penghargaanCreate from "./create";
import penghargaanDelete from "./del";
import penghargaanUpdate from "./updt";


const Penghargaan = new Elysia({prefix: "/penghargaan", tags: ["Desa/Penghargaan"]})
  .get("/find-many", penghargaanFindMany)
  .get("/:id", async (context) => {
    const response = await penghargaanFindUnique(context.request);
    return response;
  })
  .post("/create", penghargaanCreate, {
    body: t.Object({
      juara: t.String(),
      name: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
    }),
  })
  .delete("/del/:id", penghargaanDelete)
  .put("/:id", async (context) => {
    const response = await penghargaanUpdate(context);
    return response;
  }, {
    body: t.Object({
      juara: t.String(),
      name: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
    }),
  });
export default Penghargaan;