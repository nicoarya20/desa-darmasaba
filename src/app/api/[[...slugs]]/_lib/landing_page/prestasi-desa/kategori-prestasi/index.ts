import Elysia, { t } from "elysia";
import kategoriPrestasiCreate from "./create";
import kategoriPrestasiDelete from "./del";
import kategoriPrestasiFindMany from "./findMany";
import kategoriPrestasiFindUnique from "./findUnique";
import kategoriPrestasiUpdate from "./updt";

const KategoriPrestasi = new Elysia({
  prefix: "/kategoriprestasi",
  tags: ["Lingkungan/Kategori Kegiatan"],
})
  .get("/find-many", kategoriPrestasiFindMany)
  .get("/:id", async (context) => {
    const response = await kategoriPrestasiFindUnique(context);
    return response;
  })
  .delete("/del/:id", kategoriPrestasiDelete)
  .post("/create", kategoriPrestasiCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .put("/:id", kategoriPrestasiUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  });

export default KategoriPrestasi;
