import Elysia, { t } from "elysia";
import sejarahDesaFindById from "./find-by-id";
import sejarahDesaUpdate from "./update";
import sejarahDesaFindFirst from "./find-first";

const SejarahDesa = new Elysia({
  prefix: "/sejarah",
  tags: ["Desa/Profile"],
})
  .get("/first", async () => {
    const response = await sejarahDesaFindFirst();
    return response;
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
