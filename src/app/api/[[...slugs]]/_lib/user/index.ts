import { Elysia, t } from "elysia";

// Import semua handler
import userFindMany from "./findMany";
import userFindUnique from "./findUnique";
import userDelete from "./del"; // `delete` nggak boleh jadi nama file JS langsung, jadi biasanya `del.ts`
import userUpdate from "./updt";
import userDeleteAccount from "./delUser";

const User = new Elysia({ prefix: "/api/user" })
  .get("/findMany", userFindMany)
  .get("/findUnique/:id", userFindUnique)
  .put("/del/:id", userDelete, {
    params: t.Object({
      id: t.String(),
    }),
  }) // pakai PUT untuk soft delete
  .put(
    "/updt",
    userUpdate,
    {
      body: t.Object({
        id: t.String(),
        isActive: t.Optional(t.Boolean()),
        roleId: t.Optional(t.String()),
      })
    }
  )
  .delete("/delUser/:id", userDeleteAccount, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default User;
