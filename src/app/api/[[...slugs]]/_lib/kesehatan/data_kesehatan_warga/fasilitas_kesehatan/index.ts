import { Elysia, t } from "elysia";
import fasilitasKesehatanCreate from "./create";
import findManyFasilitasKesehatan from "./findMany";
import findUniqueFasilitasKesehatan from "./findUnique";
import fasilitasKesehatanUpdate from "./updt";
import fasilitasKesehatanDelete from "./del";

const FasilitasKesehatan = new Elysia({
  prefix: "fasilitas-kesehatan",
  tags: ["Kesehatan/Fasilitas Kesehatan"],
})
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
      dokterdanTenagaMedis: t.Object({
        name: t.String(),
        specialist: t.String(),
        jadwal: t.String(),
      }),
      fasilitasPendukung: t.Object({
        content: t.String(),
      }),
      prosedurPendaftaran: t.Object({
        content: t.String(),
      }),
      tarifDanLayanan: t.Object({
        layanan: t.String(),
        tarif: t.String(),
      }),
    }),
  })
  .get("/find-many", findManyFasilitasKesehatan)
  .delete("/del/:id", fasilitasKesehatanDelete)
  .get("/:id", async (context) => {
    const response = await findUniqueFasilitasKesehatan(
      new Request(context.request)
    );
    return response;
  })
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
        dokterdanTenagaMedis: t.Object({
          name: t.String(),
          specialist: t.String(),
          jadwal: t.String(),
        }),
        fasilitasPendukung: t.Object({
          content: t.String(),
        }),
        prosedurPendaftaran: t.Object({
          content: t.String(),
        }),
        tarifDanLayanan: t.Object({
          layanan: t.String(),
          tarif: t.String(),
        }),
      }),
    }
  );

export default FasilitasKesehatan;
