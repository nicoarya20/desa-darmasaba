import Elysia, { t } from "elysia";
import katagoryBeritaFindMany from "./category";
import beritaFindMany from "./find-many";
import beritaCreate from "./create";

const Berita = new Elysia({ prefix: "/berita", tags: ["Desa/Berita"] })
  .get("/category/find-many", katagoryBeritaFindMany)
  .get("/find-many", beritaFindMany)
  .post("/create", beritaCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      image: t.String(),
      content: t.String(),
      katagoryBeritaId: t.Union([t.String(), t.Null()]),
    }),
  });

export default Berita;
