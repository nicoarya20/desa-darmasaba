import Elysia, { t } from "elysia";
import prosedurPendaftaranFindMany from "./find-many";
import prosedurPendaftaranCreate from "./create";
import prosedurPendaftaranFindUnique from "./findUnique";
import persentaseKelahiranKematianUpdate from "../../persentase_kelahiran_kematian/updt";
import prosedurPendaftaranDelete from "./del";

const ProsedurPendaftaran = new Elysia({
  prefix: "/prosedurpendaftaran",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Prosedur Pendaftaran"],
})
  .get("/:id", async (context) => {
    const response = await prosedurPendaftaranFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", prosedurPendaftaranFindMany)
  .post("/create", prosedurPendaftaranCreate, {
    body: t.Object({
      content: t.String(),
    }),
  })
  .put("/:id", persentaseKelahiranKematianUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      content: t.String(),
    })
  })
  .delete("del/:id", prosedurPendaftaranDelete, {
    params: t.Object({
      id: t.String(),
    })
  })
export default ProsedurPendaftaran;
