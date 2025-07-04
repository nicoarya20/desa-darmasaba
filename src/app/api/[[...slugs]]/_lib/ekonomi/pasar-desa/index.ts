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
  // GET all
  .get("/find-many", pasarDesaFindMany)

  // GET by ID
  .get(
    "/:id",
    async (context) => {
      return await pasarDesaFindUnique(context);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // POST create
  .post(
    "/create",
    pasarDesaCreate,
    {
      body: t.Object({
        nama: t.String(),
        harga: t.Number(),
        alamatUsaha: t.String(),
        imageId: t.String(),
        rating: t.Number(),
        kategoriId: t.Array(t.String()),
      }),
    }
  )

  // DELETE
  .delete(
    "/del/:id",
    pasarDesaDelete,
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // PUT update
  .put(
    "/:id",
    async (context) => {
      const body = context.body;
      const id = context.params.id;

      // Gabungkan id ke body
      return await pasarDesaUpdate({
        ...context,
        body: {
          ...body,
          id,
        },
      });
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        nama: t.String(),
        harga: t.Number(),
        alamatUsaha: t.String(),
        imageId: t.String(),
        rating: t.Number(),
        kategoriId: t.Array(t.String()),
      }),
    }
  );

export default PasarDesa;
