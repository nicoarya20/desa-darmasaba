import Elysia, { t } from "elysia";
import kategoriBeritaFindMany from "./category";
import beritaFindMany from "./find-many";
import beritaCreate from "./create";
import beritaDelete from "./del";
import beritaUpdate from "./updt";
import findBeritaById from "./find-by-id";

const Berita = new Elysia({ prefix: "/berita", tags: ["Desa/Berita"] })
  .get("/category/find-many", kategoriBeritaFindMany)
  .get("/find-many", beritaFindMany)
  .get("/:id", async (context) => {
      const response = await findBeritaById(new Request(context.request));
      return response;
    })
  .post("/create", beritaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      content: t.String(),
      kategoriBeritaId: t.Union([t.String(), t.Null()]),
    }),
  })
  .delete("/delete/:id", beritaDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await beritaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        content: t.String(),
        kategoriBeritaId: t.Union([t.String(), t.Null()]),
      }),
    }
  );

export default Berita;
