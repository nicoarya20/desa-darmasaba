import Elysia, { t } from "elysia";
import desaDigitalCreate from "./create";
import desaDigitalDelete from "./del";
import desaDigitalUpdate from "./updt";
import desaDigitalFindUnique from "./findUnique";
import desaDigitalFindMany from "./findMany";

const DesaDigital = new Elysia({
  prefix: "/desadigital",
  tags: ["Inovasi/Desa Digital"],
})
  .post("/create", desaDigitalCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
    }),
  })
  .get("/find-many", desaDigitalFindMany)
  .get("/:id", async (context) => {
    const response = await desaDigitalFindUnique(context.request);
    return response;
  })
  .delete("/del/:id", desaDigitalDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await desaDigitalUpdate(context);
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
export default DesaDigital;
