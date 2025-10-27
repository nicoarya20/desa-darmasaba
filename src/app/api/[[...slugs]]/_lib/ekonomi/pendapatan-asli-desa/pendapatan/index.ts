import Elysia, { t } from "elysia";
import pendapatanAsliFindMany from "./findMany";
import pendapatanAsliFindUnique from "./findUnique";
import pendapatanAsliCreate from "./create";
import pendapatanAsliDelete from "./del";
import pendapatanAsliUpdate from "./updt";


const PendapatanAsli = new Elysia({
  prefix: "/pendapatanasli",
  tags: ["Ekonomi/Pendapatan Asli Desa/Pendapatan"],
})
  .get("/find-many", pendapatanAsliFindMany)
  .get("/:id", async (context) => {
    const response = await pendapatanAsliFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .post("/create", pendapatanAsliCreate, {
    body: t.Object({
      name: t.String(),
      value: t.Number(),
    }),
  })
  .delete("/del/:id", pendapatanAsliDelete)
  .put(
    "/:id",
    async (context) => {
      return await pendapatanAsliUpdate(context);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String(),
        value: t.Number(),
      }),
    }
  )
  
export default PendapatanAsli;