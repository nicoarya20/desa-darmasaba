import { Elysia, t } from "elysia";

// Import semua handler
import userFindMany from "./findMany";
import userFindUnique from "./findUnique";
import userDelete from "./del"; // `delete` nggak boleh jadi nama file JS langsung, jadi biasanya `del.ts`

const User = new Elysia({ prefix: "/api/user" })
  .get("/findMany", userFindMany)
  .get("/findUnique/:id", userFindUnique)
  .put("/del/:id", userDelete, {
    params: t.Object({
      id: t.String(),
    }),
  }); // pakai PUT untuk soft delete

export default User;
