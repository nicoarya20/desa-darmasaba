import Elysia, { t } from "elysia";
import infoTeknoCreate from "./create";
import infoTeknoDelete from "./del";
import infoTeknoUpdate from "./updt";
import infoTeknoFindUnique from "./findUnique";
import infoTeknoFindMany from "./findMany";

const InfoTekno = new Elysia({
  prefix: "/infotekno",
  tags: ["Inovasi/Info Tekno"],
})
  .post("/create", infoTeknoCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
    }),
  })
  .get("/find-many", infoTeknoFindMany)
  .get("/:id", async (context) => {
    const response = await infoTeknoFindUnique(context.request);
    return response;
  })
  .delete("/del/:id", infoTeknoDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await infoTeknoUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
      }),
    }
  );
export default InfoTekno;
