import maskotDesaUpdate from "./update";
import maskotDesaFindById from "./find-by-id";
import Elysia, { t } from "elysia";

const MaskotDesa = new Elysia({
    prefix: "/maskot",
    tags: ["Desa/Profile"],
})
.get("/:id", async (context) => {
    const response = await maskotDesaFindById(new Request(context.request));
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await maskotDesaUpdate(context);
      return response;
    },
    {
      body: t.Object({
        maskot: t.String(),
        images: t.Array(
          t.Object({
            imageId: t.String(),
            label: t.String(),
          })
        ),
      }),
    }
  )
export default MaskotDesa;