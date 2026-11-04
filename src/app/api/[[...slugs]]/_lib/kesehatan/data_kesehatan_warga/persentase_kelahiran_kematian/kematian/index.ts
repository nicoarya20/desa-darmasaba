import Elysia, { t } from "elysia";
import kematianCreate from "./create";
import kematianDelete from "./del";
import kematianFindMany from "./findMany";
import kematianFindUnique from "./findUnique";
import kematianUpdate from "./updt";

const Kematian = new Elysia({
    prefix: "/kematian",
    tags: ["Kesehatan / Data Kesehatan Warga / Persentase Kelahiran Kematian / Kematian"],
})

 .post("/create", kematianCreate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      jenisKelamin: t.String(),
      alamat: t.String(),
      penyebab: t.String(),
    }),
  })

  .get("/findMany", kematianFindMany)
  .get("/:id", async (context) => {
    const response = await kematianFindUnique(
      context.request
    );
    return response;
  })
  .put("/:id", kematianUpdate, {
    body: t.Object({
      nama: t.String(),
      tanggal: t.String(),
      jenisKelamin: t.String(),
      alamat: t.String(),
      penyebab: t.String(),
    }),
  })
  .delete("/del/:id", kematianDelete);

export default Kematian;