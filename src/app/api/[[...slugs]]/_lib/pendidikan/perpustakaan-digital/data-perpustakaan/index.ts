import Elysia, { t } from "elysia";
import dataPerpustakaanCreate from "./create";
import dataPerpustakaanDelete from "./del";
import dataPerpustakaanFindMany from "./findMany";
import dataPerpustakaanFindUnique from "./findUnique";
import dataPerpustakaanUpdate from "./updt";

const DataPerpustakaan = new Elysia({
  prefix: "/dataperpustakaan",
  tags: ["Pendidikan / Perpustakaan Digital / Data Perpustakaan"],
})

  .post("/create", dataPerpustakaanCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      kategoriId: t.String(),
    }),
  })

  .get("/findMany", dataPerpustakaanFindMany)
  .get("/:id", async (context) => {
    const response = await dataPerpustakaanFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", dataPerpustakaanUpdate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
      kategoriId: t.String(),
    }),
  })
  .delete("/del/:id", dataPerpustakaanDelete);

export default DataPerpustakaan;
