import Elysia, { t } from "elysia";
import beasiswaPendaftarCreate from "./create";
import beasiswaPendaftarFindMany from "./findMany";
import beasiswaPendaftarFindUnique from "./findUnique";
import beasiswaPendaftarUpdate from "./updt";
import beasiswaPendaftarDelete from "./del";
import { guardDataPribadi } from "../../../_data-pribadi/guard";

const BeasiswaPendaftar = new Elysia({
  prefix: "/beasiswapendaftar",
  tags: ["Pendidikan / Beasiswa Desa / Beasiswa Pendaftar"],
})

  .post("/create", beasiswaPendaftarCreate, {
    body: t.Object({
      namaLengkap: t.String(),
      nis: t.String(),
      kelas: t.String(),
      jenisKelamin: t.Union([t.Literal("LAKI_LAKI"), t.Literal("PEREMPUAN")]),
      alamatDomisili: t.String(),
      tempatLahir: t.String(),
      tanggalLahir: t.String(),
      namaOrtu: t.String(),
      nik: t.String(),
      pekerjaanOrtu: t.String(),
      penghasilan: t.String(),
      noHp: t.String(),
    }),
  })
  .get("/findMany", beasiswaPendaftarFindMany, { beforeHandle: guardDataPribadi })
  .get(
    "/:id",
    async (context) => {
      const response = await beasiswaPendaftarFindUnique(context.request);
      return response;
    },
    { beforeHandle: guardDataPribadi }
  )
  .put(
    "/:id",
    async (context) => {
      const response = await beasiswaPendaftarUpdate(context);
      return response;
    },
    {
      body: t.Object({
        namaLengkap: t.String(),
        nis: t.String(),
        kelas: t.String(),
        jenisKelamin: t.Union([t.Literal("LAKI_LAKI"), t.Literal("PEREMPUAN")]),
        alamatDomisili: t.String(),
        tempatLahir: t.String(),
        tanggalLahir: t.String(),
        namaOrtu: t.String(),
        nik: t.String(),
        pekerjaanOrtu: t.String(),
        penghasilan: t.String(),
        noHp: t.String(),
      }),
    }
  )
  .delete("/del/:id", beasiswaPendaftarDelete);

export default BeasiswaPendaftar;
