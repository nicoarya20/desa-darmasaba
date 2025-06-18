import Elysia, { t } from "elysia";
import profilePerbekelFindById from "./find-by-id";
import profilePerbekelUpdate from "./update";

const ProfilPerbekel = new Elysia({
  prefix: "/profileperbekel",
  tags: ["Desa/Profile"],
})
  .get("/:id", async (context) => {
    const response = await profilePerbekelFindById(
      new Request(context.request)
    );
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await profilePerbekelUpdate(context);
      return response;
    },
    {
      body: t.Object({
        biodata: t.String(),
        pengalaman: t.String(),
        pengalamanOrganisasi: t.String(),
        programUnggulan: t.String(),
        imageId: t.String(),
      }),
    }
  );

export default ProfilPerbekel;
