import Elysia, { t } from "elysia";
import kategoriPengumumanCreate from "./create";
import kategoriPengumumanDelete from "./del";
import kategoriPengumumanFindMany from "./findMany";
import kategoriPengumumanFindUnique from "./findUnique";
import kategoriPengumumanUpdate from "./updt";

const KategoriPengumuman = new Elysia({
    prefix: "/kategoripengumuman",
    tags: ["Desa / Pengumuman / Kategori Pengumuman"],
})

 .post("/create", kategoriPengumumanCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", kategoriPengumumanFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriPengumumanFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kategoriPengumumanUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", kategoriPengumumanDelete);

export default KategoriPengumuman;