import Elysia, { t } from "elysia";
import keteranganBankSampahTerdekatCreate from "./create";
import keteranganBankSampahTerdekatDelete from "./del";
import keteranganBankSampahTerdekatFindMany from "./findMany";
import keteranganBankSampahTerdekatFindUnique from "./findUnique";
import keteranganBankSampahTerdekatUpdate from "./updt";
import BankSampahDaftarAnak from "./bank-sampah.anak";

// Field detail baru (opsional, additive): isi divalidasi skema zod `bankSampahBodySchema`.
const teksOpsional = t.Optional(t.Nullable(t.String()));
const bankSampahBody = t.Object({
  name: t.String(),
  alamat: t.String(),
  namaTempatMaps: t.String(),
  lat: t.Number(),
  lng: t.Number(),
  deskripsi: teksOpsional,
  kontak: teksOpsional,
  mediaSosial: t.Optional(t.Nullable(t.Array(t.Object({ platform: t.String(), url: t.String() })))),
  linkPetunjukArah: teksOpsional,
  fotoBaganStrukturId: teksOpsional,
  programInovasiIds: t.Optional(t.Array(t.String())),
});

const KeteranganBankSampahTerdekat = new Elysia({
  prefix: "/keteranganbankterdekat",
  tags: ["Lingkungan/Pengelolaan Sampah/Keterangan Bank Sampah Terdekat"],
})
  .get("/find-many", keteranganBankSampahTerdekatFindMany)
  .get("/:id", async (context) => {
    const response = await keteranganBankSampahTerdekatFindUnique(context);
    return response;
  })
  .post("/create", keteranganBankSampahTerdekatCreate, { body: bankSampahBody })
  .put(
    "/:id",
    async (context) => {
      const response = await keteranganBankSampahTerdekatUpdate(context);
      return response;
    },
    { body: bankSampahBody }
  )
  .delete("/del/:id", keteranganBankSampahTerdekatDelete)
  .use(BankSampahDaftarAnak);

export default KeteranganBankSampahTerdekat;
