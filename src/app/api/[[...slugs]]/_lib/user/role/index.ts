import Elysia, { t } from "elysia";
import roleCreate from "./create";
import roleDelete from "./del";
import roleFindMany from "./findMany";
import roleFindUnique from "./findUnique";
import roleUpdate from "./updt";
import { resolveRoleManager } from "../guard";

const Role = new Elysia({
    prefix: "/role",
    tags: ["User / Role"],
})

  .get("/findMany", roleFindMany)
  .get("/:id", async (context) => {
    const response = await roleFindUnique(
      context.request
    );
    return response;
  })
  // resolve lokal grup: hanya mutasi yang butuh role 0/1 (+ `actor` untuk audit); GET tetap terbuka.
  .guard({}, (app) =>
    app
      .resolve(resolveRoleManager)
      .post("/create", roleCreate, {
        body: t.Object({
          name: t.String(),
        }),
      })
      .put("/:id", roleUpdate, {
        body: t.Object({
          name: t.String(),
        }),
      })
      .delete("/del/:id", roleDelete),
  );

export default Role;
