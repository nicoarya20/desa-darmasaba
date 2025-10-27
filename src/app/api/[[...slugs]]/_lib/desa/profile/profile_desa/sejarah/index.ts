import Elysia, { t } from "elysia";
import sejarahDesaFindById from "./find-by-id";
import sejarahDesaUpdate from "./update";

const SejarahDesa = new Elysia({
  prefix: "/sejarah",
  tags: ["Desa/Profile"],
})
  .get("/:id", async (context) => {
    const response = await sejarahDesaFindById(new Request(context.request));
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await sejarahDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
      }),
    }
  );

export default SejarahDesa;
