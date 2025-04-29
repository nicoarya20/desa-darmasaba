import Elysia, { t } from "elysia";
import informasiUmumFindMany from "./find-many";
import informasiUmumCreate from "./create";

const InformasiUmum = new Elysia({
  prefix: "/informasiumum",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Informasi Umum"],
})
  .get("/find-many", informasiUmumFindMany)
  .post("/create", informasiUmumCreate, {
    body: t.Object({
      fasilitas: t.String(),
      alamat: t.String(),
      jamOperasional: t.String(),
    }),
  });

export default InformasiUmum;
