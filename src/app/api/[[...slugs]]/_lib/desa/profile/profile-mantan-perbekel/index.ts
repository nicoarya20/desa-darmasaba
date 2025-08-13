import Elysia, { t } from "elysia";
import profileMantanPerbekelCreate from "./create";
import profileMantanPerbekelDelete from "./del";
import profileMantanPerbekelFindMany from "./findMany";
import profileMantanPerbekelUpdate from "./updt";
import profileMantanPerbekelFindUnique from "./findUnique";

const MantanPerbekel = new Elysia({
  prefix: "mantanperbekel",
  tags: ["Desa/Profile/MantanPerbekel"],
})
  .get("/findMany", profileMantanPerbekelFindMany)
  .get("/:id", async (context) => {
    const response = await profileMantanPerbekelFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .post("/create", profileMantanPerbekelCreate, {
    body: t.Object({
      nama: t.String(),
      daerah: t.String(),
      periode: t.String(),
      imageId: t.String(),
    }),
  })
  .delete("/del/:id", profileMantanPerbekelDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await profileMantanPerbekelUpdate(context);
      return response;
    },
    {
      body: t.Object({
        nama: t.String(),
        daerah: t.String(),
        periode: t.String(),
        imageId: t.String(),
      }),
    }
  );

export default MantanPerbekel;
