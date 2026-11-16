import Elysia from "elysia";
import { t } from "elysia";
import respondenFindMany from "./findMany";
import respondenFindUnique from "./findUnique";
import respondenCreate from "./create";
import respondenUpdate from "./updt";
import respondenDelete from "./del";
import respondenRingkasan from "./ringkasan";
import { guardDataPribadi } from "../../../_data-pribadi/guard";

const Responden = new Elysia({ prefix: "/responden", tags: ["Desa/Responden"] })
  // Publik: hanya tanggal + kategori untuk grafik IKM, tanpa id & nama responden.
  .get("/ringkasan", respondenRingkasan)
  .get("/findMany", respondenFindMany, { beforeHandle: guardDataPribadi })
  .get(
    "/:id",
    async (context) => {
      const response = await respondenFindUnique(context.request);
      return response;
    },
    { beforeHandle: guardDataPribadi }
  )
  .post("/create", respondenCreate, {
    body: t.Object({
      name: t.String(),
      tanggal: t.String(),
      jenisKelaminId: t.String(),
      ratingId: t.String(),
      kelompokUmurId: t.String(),
    }),
  })
  .delete("/del/:id", respondenDelete)
  .put(
    "/:id",
    async (context) => {
      const response = await respondenUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        tanggal: t.String(),
        jenisKelaminId: t.String(),
        ratingId: t.String(),
        kelompokUmurId: t.String(),
      }),
    }
  );

export default Responden;
