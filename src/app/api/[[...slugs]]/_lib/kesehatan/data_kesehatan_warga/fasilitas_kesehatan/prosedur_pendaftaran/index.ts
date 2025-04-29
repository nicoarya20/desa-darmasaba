import Elysia, { t } from "elysia";
import prosedurPendaftaranFindMany from "./find-many";
import prosedurPendaftaranCreate from "./create";

const ProsedurPendaftaran = new Elysia({
  prefix: "/prosedurpendaftaran",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Prosedur Pendaftaran"],
})
  .get("/find-many", prosedurPendaftaranFindMany)
  .post("/create", prosedurPendaftaranCreate, {
    body: t.Object({
      content: t.String(),
    }),
  });
export default ProsedurPendaftaran;
