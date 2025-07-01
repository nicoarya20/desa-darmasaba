import Elysia, { t } from "elysia";
import kontakDaruratKeamananCreate from "./create";
import kontakDaruratKeamananDelete from "./del";
import kontakDaruratKeamananFindMany from "./findMany";
import kontakDaruratKeamananFindUnique from "./findUnique";
import kontakDaruratKeamananUpdate from "./updt";

const KontakDaruratKeamanan = new Elysia({
  prefix: "/kontak-darurat-keamanan",
  tags: ["Keamanan/Kontak Darurat"],
})
  .get("/find-many", kontakDaruratKeamananFindMany)
  .get("/:id", async (context) => {
    const response = await kontakDaruratKeamananFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .post("/create", kontakDaruratKeamananCreate, {
    body: t.Object({
      nama: t.String(),
      imageId: t.Optional(t.String()),
      kontakItems: t.Array(
        t.Object({
          nama: t.String(),
          nomorTelepon: t.String(),
          imageId: t.Optional(t.String()),
        })
      ),
    }),
  })
  .delete("/del/:id", kontakDaruratKeamananDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await kontakDaruratKeamananUpdate(context);
      return response;
    },
    {
      body: t.Object({
        nama: t.String(),
        imageId: t.Optional(t.String()),
        kontakItems: t.Array(
          t.Object({
            nama: t.String(),
            nomorTelepon: t.String(),
            imageId: t.Optional(t.String()),
          })
        ),
      }),
    }
  );
export default KontakDaruratKeamanan;
