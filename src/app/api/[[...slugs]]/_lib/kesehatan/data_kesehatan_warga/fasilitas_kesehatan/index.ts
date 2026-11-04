import { Elysia, t } from "elysia";
import fasilitasKesehatanCreate from "./create";
import fasilitasKesehatanFindMany from "./findMany";
import findUniqueFasilitasKesehatan from "./findUnique";
import fasilitasKesehatanUpdate from "./updt";
import fasilitasKesehatanDelete from "./del";

const FasilitasKesehatan = new Elysia({
  prefix: "fasilitas-kesehatan",
  tags: ["Kesehatan/Fasilitas Kesehatan"],
})

  // ==========================
  //        CREATE
  // ==========================
  .post("/create", fasilitasKesehatanCreate, {
    body: t.Object({
      name: t.String(),

      informasiUmum: t.Object({
        fasilitas: t.String(),
        alamat: t.String(),
        jamOperasional: t.String(),
      }),

      layananUnggulan: t.Object({
        content: t.String(),
      }),

      dokterdanTenagaMedis: t.Array(t.String()), // FIX karena create pakai array of string

      fasilitasPendukung: t.Object({
        content: t.String(),
      }),

      prosedurPendaftaran: t.Object({
        content: t.String(),
      }),

      tarifDanLayanan: t.Array(t.String()), // FIX karena create pakai array of string
    }),
  })

  // ==========================
  //        FIND MANY
  // ==========================
  .get("/find-many", fasilitasKesehatanFindMany)

  // ==========================
  //        DELETE
  // ==========================
  .delete("/del/:id", fasilitasKesehatanDelete)

  // ==========================
  //        FIND UNIQUE
  // ==========================
  .get("/:id", async (context) => {
    const response = await findUniqueFasilitasKesehatan(
      context.request
    );
    return response;
  })

  // ==========================
  //        UPDATE
  // ==========================
  .put(
    "/:id",
    async (context) => {
      const response = await fasilitasKesehatanUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),

        informasiUmum: t.Object({
          fasilitas: t.String(),
          alamat: t.String(),
          jamOperasional: t.String(),
        }),

        layananUnggulan: t.Object({
          content: t.String(),
        }),

        // FIX → harus array of string (ID dokter)
        dokterdanTenagaMedis: t.Array(t.String()),

        fasilitasPendukung: t.Object({
          content: t.String(),
        }),

        prosedurPendaftaran: t.Object({
          content: t.String(),
        }),

        // FIX → harus array of string (ID tarif)
        tarifDanLayanan: t.Array(t.String()),
      }),
    }
  );

export default FasilitasKesehatan;
