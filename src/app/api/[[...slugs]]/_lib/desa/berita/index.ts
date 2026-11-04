import Elysia, { t } from "elysia";
import beritaFindMany from "./find-many";
import beritaCreate from "./create";
import beritaDelete from "./del";
import beritaUpdate from "./updt";
import findBeritaById from "./find-by-id";
import beritaFindFirst from "./findFirst";
import findRecentBerita from "./findRecent";

const Berita = new Elysia({ prefix: "/berita", tags: ["Desa/Berita"] })
  .get("/find-many", beritaFindMany)
  .get("/find-many-ui", beritaFindMany)
  .get("/:id", async (context) => {
      const response = await findBeritaById(context.request);
      return response;
    })
  .post("/create", beritaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      content: t.String(),
      kategoriBeritaId: t.Union([t.String(), t.Null()]),
      imageIds: t.Array(t.String()),
      linkVideo: t.Optional(t.String()),
    }),
  })
  .get("/find-first", beritaFindFirst)
  .get("/find-recent", findRecentBerita)
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
        imageIds: t.Array(t.String()),
        linkVideo: t.Optional(t.String()),
      }),
    }
  );
  

export default Berita;
