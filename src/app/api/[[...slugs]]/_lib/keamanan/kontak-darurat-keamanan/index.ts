import Elysia, { t } from "elysia";
import kontakDaruratKeamananCreate from "./create";
import kontakDaruratKeamananDelete from "./del";
import kontakDaruratKeamananFindMany from "./findMany";
import kontakDaruratKeamananFindUnique from "./findUnique";
import kontakDaruratKeamananUpdate from "./updt";

const KontakDaruratKeamanan = new Elysia({
  prefix: "/kontakdaruratkeamanan",
  tags: ["Keamanan/Kontak Darurat"],
})
  .get("/findMany", kontakDaruratKeamananFindMany)
  .get(
    "/:id",
    async (context) => {
      return await kontakDaruratKeamananFindUnique(context);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post("/create", kontakDaruratKeamananCreate, {
    body: t.Object({
      nama: t.String(),
      imageId: t.Optional(t.String()),
      kategoriId: t.Array(t.String()),
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
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        nama: t.String(),
        imageId: t.Optional(t.String()),
        kategoriId: t.Array(t.String()),
      }),
    }
  );
export default KontakDaruratKeamanan;
