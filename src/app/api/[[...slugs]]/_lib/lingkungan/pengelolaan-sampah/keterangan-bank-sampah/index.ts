import Elysia, { t } from "elysia";
import keteranganBankSampahTerdekatCreate from "./create";
import keteranganBankSampahTerdekatDelete from "./del";
import keteranganBankSampahTerdekatFindMany from "./findMany";
import keteranganBankSampahTerdekatFindUnique from "./findUnique";
import keteranganBankSampahTerdekatUpdate from "./updt";

const KeteranganBankSampahTerdekat = new Elysia({
  prefix: "/keteranganbankterdekat",
  tags: ["Lingkungan/Pengelolaan Sampah/Keterangan Bank Sampah Terdekat"],
})
  .get("/find-many", keteranganBankSampahTerdekatFindMany)
  .get("/:id", async (context) => {
    const response = await keteranganBankSampahTerdekatFindUnique(context);
    return response;
  })
  .post("/create", keteranganBankSampahTerdekatCreate, {
    body: t.Object({
      name: t.String(),
      alamat: t.String(),
      namaTempatMaps: t.String(),
      lat: t.Number(),
      lng: t.Number(),
    }),
  })
  .put(
    "/:id",
    async (context) => {
      const response = await keteranganBankSampahTerdekatUpdate(context);
      return response;
    },
    {
      body: t.Object({
        name: t.String(),
        alamat: t.String(),
        namaTempatMaps: t.String(),
        lat: t.Number(),
        lng: t.Number(),
      }),
    }
  )
  .delete("/del/:id", keteranganBankSampahTerdekatDelete);

export default KeteranganBankSampahTerdekat;
