import Elysia, { t } from "elysia";
import roleCreate from "./create";
import roleDelete from "./del";
import roleFindMany from "./findMany";
import roleFindUnique from "./findUnique";
import roleUpdate from "./updt";
import { roleManagerBeforeHandle } from "../guard";

const Role = new Elysia({
    prefix: "/role",
    tags: ["User / Role"],
})

 .post("/create", roleCreate, {
    beforeHandle: roleManagerBeforeHandle,
    body: t.Object({
      name: t.String(),
    }),
  })

  .get("/findMany", roleFindMany)
  .get("/:id", async (context) => {
    const response = await roleFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", roleUpdate, {
    beforeHandle: roleManagerBeforeHandle,
    body: t.Object({
      name: t.String(),
    }),
  })
  .delete("/del/:id", roleDelete, { beforeHandle: roleManagerBeforeHandle });

export default Role;