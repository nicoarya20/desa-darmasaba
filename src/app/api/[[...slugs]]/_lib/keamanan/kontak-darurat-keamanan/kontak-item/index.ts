import Elysia, { t } from "elysia";
import kontakItemCreate from "./create";
import kontakItemDelete from "./del";
import kontakItemFindMany from "./findMany";
import kontakItemFindUnique from "./findUnique";
import kontakItemUpdate from "./updt";

const KontakItem = new Elysia({
  prefix: "/kontakitem",
  tags: ["Keamanan/Kontak Item"],
})
  .get("/find-many", kontakItemFindMany)
  .get("/:id", async (context) => {
    const response = await kontakItemFindUnique(new Request(context.request));
    return response;
  })
  .post("/create", kontakItemCreate, {
    body: t.Object({
      nama: t.String(),
      imageId: t.Optional(t.String()),
      nomorTelepon: t.String(),
    }),
  })
  .delete("/del/:id", kontakItemDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await kontakItemUpdate(context);
      return response;
    },
    {
      body: t.Object({
        nama: t.String(),
        imageId: t.Optional(t.String()),
        nomorTelepon: t.String(),

      }),
    }
  );
export default KontakItem;
