import Elysia, { t } from "elysia";
import menuTipsKeamananFindMany from "./findMany";
import menuTipsKeamananFindUnique from "./findUnique";
import menuTipsKeamananCreate from "./create";
import menuTipsKeamananDelete from "./del";
import menuTipsKeamananUpdate from "./updt";

const MenuTipsKeamanan = new Elysia({
  prefix: "/menutipskeamanan",
  tags: ["Keamanan/Tips Keamanan"],
})
  .get("/find-many", menuTipsKeamananFindMany)
  .get("/:id", async (context) => {
    const response = await menuTipsKeamananFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .post("/create", menuTipsKeamananCreate, {
    body: t.Object({
      judul: t.String(),
      deskripsi: t.String(),
      imageId: t.String(),
    }),
  })
  .delete("/del/:id", menuTipsKeamananDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await menuTipsKeamananUpdate(context);
      return response;
    },
    {
      body: t.Object({
        judul: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
      }),
    }
  );
export default MenuTipsKeamanan;
