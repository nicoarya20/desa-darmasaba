import Elysia, { t } from "elysia";
import kategoriBeritaFindMany from "./category";
import beritaFindMany from "./find-many";
import beritaCreate from "./create";

const Berita = new Elysia({ prefix: "/berita", tags: ["Desa/Berita"] })
  .get("/category/find-many", kategoriBeritaFindMany)
  .get("/find-many", beritaFindMany)
  .post("/create", beritaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      content: t.String(),
      kategoriBeritaId: t.Union([t.String(), t.Null()]),
    }),
  });

export default Berita;
