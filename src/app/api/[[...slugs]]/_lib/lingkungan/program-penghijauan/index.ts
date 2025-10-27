import Elysia, { t } from "elysia";
import programPenghijauanFindMany from "./findMany";
import programPenghijauanFindUnique from "./findUnique";
import programPenghijauanCreate from "./create";
import programPenghijauanUpdate from "./updt";
import programPenghijauanDelete from "./del";

const ProgramPenghijauan = new Elysia({
  prefix: "/programpenghijauan",
  tags: ["Lingkungan/Program Penghijauan"],
})
  .get("/find-many", programPenghijauanFindMany)
  .get("/:id", async (context) => {
    const response = await programPenghijauanFindUnique(context);
    return response;
  })
  .post("/create", programPenghijauanCreate, {
    body: t.Object({
      name: t.String(),
      judul: t.String(),
      deskripsi: t.String(),
      icon: t.String(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await programPenghijauanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        judul: t.String(),
        deskripsi: t.String(),
        icon: t.String(),
      }),
    }
  )
  .delete("/del/:id", programPenghijauanDelete);
  export default ProgramPenghijauan;
