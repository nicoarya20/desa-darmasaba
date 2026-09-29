import Elysia, { t } from "elysia";
import jenisKelaminRespondenCreate from "./create";
import jenisKelaminRespondenDelete from "./del";
import jenisKelaminRespondenFindMany from "./findMany";
import jenisKelaminRespondenFindUnique from "./findUnique";
import jenisKelaminRespondenUpdate from "./updt";

const JenisKelaminResponden = new Elysia({
    prefix: "/jeniskelaminresponden",
    tags: ["PPID / Indeks Kepuasan / Jenis Kelamin Responden"],
})

 .post("/create", jenisKelaminRespondenCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", jenisKelaminRespondenFindMany)
  .get("/:id", async (context) => {
    const response = await jenisKelaminRespondenFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", jenisKelaminRespondenUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", jenisKelaminRespondenDelete);

export default JenisKelaminResponden;