import Elysia, { t } from "elysia";

import lambangDesaFindById from "./find-by-id";
import lambangDesaUpdate from "./update";

const LambangDesa = new Elysia({
  prefix: "/lambang",
  tags: ["Desa/Profile"],
})
  .get("/:id", async (context) => {
    const response = await lambangDesaFindById(context.request);
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await lambangDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
      }),
    }
  );

export default LambangDesa;
