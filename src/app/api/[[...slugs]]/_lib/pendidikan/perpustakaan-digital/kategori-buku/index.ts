import Elysia, { t } from "elysia";
import kategoriBukuCreate from "./create";
import kategoriBukuDelete from "./del";
import kategoriBukuFindMany from "./findMany";
import kategoriBukuFindUnique from "./findUnique";
import kategoriBukuUpdate from "./updt";
import kategoriBukuFindManyAll from "./findManyAll";

const KategoriBuku = new Elysia({
    prefix: "/kategoribuku",
    tags: ["Pendidikan / Perpustakaan Digital / Kategori Buku"],
})

 .post("/create", kategoriBukuCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", kategoriBukuFindMany)
  .get("/findManyAll", kategoriBukuFindManyAll)
  .get("/:id", async (context) => {
    const response = await kategoriBukuFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kategoriBukuUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", kategoriBukuDelete);

export default KategoriBuku;