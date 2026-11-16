import Elysia, { t } from "elysia";
import inovasiTeknologiCreate from "./create";
import inovasiTeknologiDelete from "./del";
import inovasiTeknologiUpdate from "./updt";
import inovasiTeknologiFindUnique from "./findUnique";
import inovasiTeknologiFindMany from "./findMany";
import { kategoriBodySchema } from "./inovasi-teknologi.query";

/** API Inovasi Teknologi Desa (gabungan Desa Digital / Smart Village + Info Teknologi Tepat Guna). */
const InovasiTeknologiDesa = new Elysia({
  prefix: "/inovasiteknologi",
  tags: ["Inovasi/Inovasi Teknologi Desa"],
})
  .post("/create", inovasiTeknologiCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      kategori: kategoriBodySchema,
    }),
  })
  .get("/find-many", inovasiTeknologiFindMany)
  .get("/:id", async (context) => {
    const response = await inovasiTeknologiFindUnique(context.request);
    return response;
  })
  .delete("/del/:id", inovasiTeknologiDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await inovasiTeknologiUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        kategori: kategoriBodySchema,
      }),
    }
  );
export default InovasiTeknologiDesa;
