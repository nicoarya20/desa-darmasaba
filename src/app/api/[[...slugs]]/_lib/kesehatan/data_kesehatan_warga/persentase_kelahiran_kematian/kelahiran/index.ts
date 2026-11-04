import Elysia, { t } from "elysia";
import kelahiranCreate from "./create";
import kelahiranDelete from "./del";
import kelahiranFindMany from "./findMany";
import kelahiranFindUnique from "./findUnique";
import kelahiranUpdate from "./updt";

const Kelahiran = new Elysia({
    prefix: "/kelahiran",
    tags: ["Kesehatan / Data Kesehatan Warga / Persentase Kelahiran Kematian / Kelahiran"],
})

 .post("/create", kelahiranCreate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      jenisKelamin: t.String(),
      alamat: t.String(),
    }),
  })

  .get("/findMany", kelahiranFindMany)
  .get("/:id", async (context) => {
    const response = await kelahiranFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kelahiranUpdate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      jenisKelamin: t.String(),
      alamat: t.String(),
    }),
  })
  .delete("/del/:id", kelahiranDelete);

export default Kelahiran;