import Elysia, { t } from "elysia";
import ajukanIdeInovatifCreate from "./create";
import ajukanIdeInovatifFindMany from "./findMany";
import ajukanIdeInovatifFindUnique from "./findUnique";
import ajukanIdeInovatifDelete from "./del";

const AjukanIdeInovatif = new Elysia({
  prefix: "/ajukanideinovatif",
  tags: ["Inovasi/AjukanIde"],
})
  .post("/create", ajukanIdeInovatifCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      alamat: t.String(),
      namaIde: t.String(),
      masalah: t.String(),
      benefit: t.String(),
    }),
  })
  .get("/find-many", ajukanIdeInovatifFindMany)
  .get("/:id", async (context) => {
    const response = await ajukanIdeInovatifFindUnique(context.request);
    return response;
  })
  .delete("/del/:id", ajukanIdeInovatifDelete);
export default AjukanIdeInovatif;
