import Elysia, { t } from "elysia";
import pasarDesaCreate from "./create";
import pasarDesaDelete from "./del";
import pasarDesaFindMany from "./findMany";
import pasarDesaUpdate from "./updt";
import pasarDesaFindUnique from "./findUnique";

const PasarDesa = new Elysia({
  prefix: "/pasardesa",
  tags: ["Ekonomi/Pasar Desa"],
})
  .get("/find-many", pasarDesaFindMany)
  .get("/:id", async (context) => {
    const response = await pasarDesaFindUnique(new Request(context.request));
    return response;
  })
  .post("/create", pasarDesaCreate, {
    body: t.Object({
      nama: t.String(),
      harga: t.Number(),
      satuan: t.String(),
      alamat: t.String(),
      imageId: t.String(),
      rating: t.Number(),
      kategoriId:t.String(),
    }),
  })
  .delete("/del/:id", pasarDesaDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await pasarDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        nama: t.String(),
        harga: t.Number(),
        satuan: t.String(),
        alamat: t.String(),
        imageId: t.String(),
        rating: t.Number(),
        kategoriId: t.String(),
      }),
    }
  );

export default PasarDesa;
