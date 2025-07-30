import { Elysia, t } from "elysia";

// Import semua handler
import userCreate from "./create";
import userFindMany from "./findMany";
import userFindUnique from "./findUnique";
import userUpdate from "./updt";
import userDelete from "./del"; // `delete` nggak boleh jadi nama file JS langsung, jadi biasanya `del.ts`
import userLogin from "./login";
import userRegister from "./register";

const User = new Elysia({ prefix: "/api/user" })
  .post("/register", userRegister, {
    body: t.Object({
      nama: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/login", userLogin, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .post("/create", userCreate, {
    body: t.Object({
      nama: t.String(),
      email: t.String(),
      password: t.String(),
      roleId: t.String(),
    }),
  })
  .get("/findMany", userFindMany)
  .get("/findUnique/:id", userFindUnique)
  .put(
    "/update/:id",
    async (context) => {
      const response = await userUpdate(context);
      return response;
    },
    {
      body: t.Object({
        nama: t.String(),
        email: t.String(),
        password: t.String(),
        roleId: t.String(),
      }),
    }
  )
  .put("/del/:id", userDelete, {
    params: t.Object({
      id: t.String(),
    }),
  }); // pakai PUT untuk soft delete

export default User;
