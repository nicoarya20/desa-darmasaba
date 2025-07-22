import Elysia, { t } from "elysia";
import kategoriKegiatanCreate from "./create";
import kategoriKegiatanDelete from "./del";
import kategoriKegiatanFindMany from "./findMany";
import kategoriKegiatanFindUnique from "./findUnique";
import kategoriKegiatanUpdate from "./updt";

const KategoriKegiatan = new Elysia({
  prefix: "/kategorikegiatan",
  tags: ["Lingkungan/Kategori Kegiatan"],
})
  .get("/find-many", kategoriKegiatanFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriKegiatanFindUnique(context);
    return response;
  })
  .delete("/del/:id", kategoriKegiatanDelete)
  .post("/create", kategoriKegiatanCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .put("/:id", kategoriKegiatanUpdate, {
    body: t.Object({
      id: t.String(),
      nama: t.String(),
    }),
  });

export default KategoriKegiatan;
