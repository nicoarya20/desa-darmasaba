import Elysia, { t } from "elysia";
import beasiswaPendaftarCreate from "./create";
import beasiswaPendaftarFindMany from "./findMany";
import beasiswaPendaftarFindUnique from "./findUnique";
import beasiswaPendaftarUpdate from "./updt";
import beasiswaPendaftarDelete from "./del";

const BeasiswaPendaftar = new Elysia({
  prefix: "/beasiswapendaftar",
  tags: ["Pendidikan / Beasiswa Desa / Beasiswa Pendaftar"],
})

  .post("/create", beasiswaPendaftarCreate, {
    body: t.Object({
      namaLengkap: t.String(),
      nik: t.String(),
      tempatLahir: t.String(),
      tanggalLahir: t.String(),
      jenisKelamin: t.String(),
      kewarganegaraan: t.String(),
      agama: t.String(),
      alamatKTP: t.String(),
      alamatDomisili: t.String(),
      noHp: t.String(),
      email: t.String(),
      statusPernikahan: t.String(),
      ukuranBaju: t.String(),
    }),
  })
  .get("/findMany", beasiswaPendaftarFindMany)
  .get("/:id", async (context) => {
    const response = await beasiswaPendaftarFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .put(
    "/:id",
    async (context) => {
      const response = await beasiswaPendaftarUpdate(context);
      return response;
    },
    {
      body: t.Object({
        namaLengkap: t.String(),
        nik: t.String(),
        tempatLahir: t.String(),
        tanggalLahir: t.String(),
        jenisKelamin: t.String(),
        kewarganegaraan: t.String(),
        agama: t.String(),
        alamatKTP: t.String(),
        alamatDomisili: t.String(),
        noHp: t.String(),
        email: t.String(),
        statusPernikahan: t.String(),
        ukuranBaju: t.String(),
      }),
    }
  )
  .delete("/del/:id", beasiswaPendaftarDelete);

export default BeasiswaPendaftar;
