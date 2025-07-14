import Elysia, { t } from "elysia";
import programKreatifFindMany from "./findMany";
import programKreatifFindUnique from "./findUnique";
import programKreatifCreate from "./create";
import programKreatifUpdate from "./updt";
import programKreatifDelete from "./del";

const ProgramKreatif = new Elysia({
  prefix: "/programkreatif",
  tags: ["Inovasi/Program Kreatif"],
})
  .get("/find-many", programKreatifFindMany)
  .get("/:id", async (context) => {
    const response = await programKreatifFindUnique(context);
    return response;
  })
  .post("/create", programKreatifCreate, {
    body: t.Object({
      name: t.String(),
      slug: t.String(),
      deskripsi: t.String(),
      icon: t.String(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await programKreatifUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        slug: t.String(),
        deskripsi: t.String(),
        icon: t.String(),
      }),
    }
  )
  .delete("/del/:id", programKreatifDelete);
  export default ProgramKreatif;
