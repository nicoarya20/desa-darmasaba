import Elysia, { t } from "elysia";
import keunggulanProgramCreate from "./create";
import keunggulanProgramFindMany from "./findMany";
import keunggulanProgramFindUnique from "./findUnique";
import keunggulanProgramUpdate from "./updt";
import keunggulanProgramDelete from "./del";

const KeunggulanProgram = new Elysia({
  prefix: "/keunggulanprogram",
  tags: ["Pendidikan / Beasiswa Desa / Keunggulan Program"],
})

  .post("/create", keunggulanProgramCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
    }),
  })
  .get("/findMany", keunggulanProgramFindMany)
  .get("/:id", async (context) => {
    const response = await keunggulanProgramFindUnique(
      context.request
    );
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await keunggulanProgramUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
      }),
    }
  )
  .delete("/del/:id", keunggulanProgramDelete);

export default KeunggulanProgram;
