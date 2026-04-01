import Elysia, { t } from "elysia";
import roleCreate from "./create";
import roleDelete from "./del";
import roleFindMany from "./findMany";
import roleFindUnique from "./findUnique";
import roleUpdate from "./updt";

const Role = new Elysia({
    prefix: "/role",
    tags: ["User / Role"],
})

 .post("/create", roleCreate, {
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", roleFindMany)
  .get("/:id", async (context) => {
    const response = await roleFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put("/:id", roleUpdate, {
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", roleDelete);

export default Role;