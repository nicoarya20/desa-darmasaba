import Elysia, { t } from "elysia";
import kategoriKegiatanCreate from "./create";
import kategoriKegiatanDelete from "./del";
import kategoriKegiatanFindMany from "./findMany";
import kategoriKegiatanFindUnique from "./findUnique";
import kategoriKegiatanUpdate from "./updt";

const KategoriKegiatan = new Elysia({
    prefix: "/kategorikegiatan",
    tags: ["Desa / Kegiatan Desa / Kategori Kegiatan"],
})

 .post("/create", kategoriKegiatanCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })

  .get("/findMany", kategoriKegiatanFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriKegiatanFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", kategoriKegiatanUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .delete("/del/:id", kategoriKegiatanDelete);

export default KategoriKegiatan;