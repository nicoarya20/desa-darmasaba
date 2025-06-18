import Elysia, { t } from "elysia";
import visiMisiDesaUpdate from "./update";
import visiMisiDesaFindById from "./find-by-id";

const VisiMisiDesa = new Elysia({
  prefix: "/visi-misi",
  tags: ["Desa/Profile"],
})
  .get("/:id", async (context) => {
    const response = await visiMisiDesaFindById(new Request(context.request));
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await visiMisiDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        visi: t.String(),
        misi: t.String(),
      }),
    }
  );

export default VisiMisiDesa;
