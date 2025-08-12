import Elysia, { t } from "elysia";
import umurRespondenCreate from "./create";
import umurRespondenDelete from "./del";
import umurRespondenFindMany from "./findMany";
import umurRespondenFindUnique from "./findUnique";
import umurRespondenUpdate from "./updt";

const UmurResponden = new Elysia({
    prefix: "/umurresponden",
    tags: ["PPID / Indeks Kepuasan / Umur Responden"],
})

 .post("/create", umurRespondenCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", umurRespondenFindMany)
  .get("/:id", async (context) => {
    const response = await umurRespondenFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", umurRespondenUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", umurRespondenDelete);

export default UmurResponden;