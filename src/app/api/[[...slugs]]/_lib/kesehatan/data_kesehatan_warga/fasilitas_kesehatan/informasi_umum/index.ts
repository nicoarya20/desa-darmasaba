import Elysia, { t } from "elysia";
import informasiUmumFindMany from "./find-many";
import informasiUmumCreate from "./create";
import informasiUmumFindUnique from "./findUnique";
import informasiumumUpdate from "./updt";
import informasiumumDelete from "./del";

const InformasiUmum = new Elysia({
  prefix: "/informasiumum",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Informasi Umum"],
})
  .get("/:id", async (context) => {
    const response = await informasiUmumFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", informasiUmumFindMany)
  .post("/create", informasiUmumCreate, {
    body: t.Object({
      fasilitas: t.String(),
      alamat: t.String(),
      jamOperasional: t.String(),
    }),
  })
  .put(":/id", informasiumumUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      fasilitas: t.String(),
      alamat: t.String(),
      jamOperasional: t.String(),
    }),
  })
  .delete("/del/:id", informasiumumDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })

export default InformasiUmum;
