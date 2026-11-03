import Elysia, { t } from "elysia";
import kategoriPotensiCreate from "./create";
import kategoriPotensiDelete from "./del";
import kategoriPotensiFindMany from "./findMany";
import kategoriPotensiFindUnique from "./findUnique";
import kategoriPotensiUpdate from "./updt";

const KategoriPotensi = new Elysia({
    prefix: "/kategoripotensi",
    tags: ["Desa / Potensi"],
})

 .post("/create", kategoriPotensiCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })

  .get("/findMany", kategoriPotensiFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriPotensiFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kategoriPotensiUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .delete("/del/:id", kategoriPotensiDelete);

export default KategoriPotensi;