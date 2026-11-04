import Elysia, { t } from "elysia";
import kategoriBeritaCreate from "./create";
import kategoriBeritaDelete from "./del";
import kategoriBeritaFindMany from "./findMany";
import kategoriBeritaFindUnique from "./findUnique";
import kategoriBeritaUpdate from "./updt";

const KategoriBerita = new Elysia({
    prefix: "/kategoriberita",
    tags: ["Desa / Berita / Kategori Berita"],
})

 .post("/create", kategoriBeritaCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", kategoriBeritaFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriBeritaFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kategoriBeritaUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", kategoriBeritaDelete);

export default KategoriBerita;