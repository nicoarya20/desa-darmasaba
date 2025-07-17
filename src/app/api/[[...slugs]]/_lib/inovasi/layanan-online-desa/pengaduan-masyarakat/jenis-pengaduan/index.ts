import Elysia from "elysia";
import jenisPengaduanFindMany from "./findMany";
import jenisPengaduanFindUnique from "./findUnique";
import jenisPengaduanCreate from "./create";
import jenisPengaduanUpdate from "./updt";
import { t } from "elysia";
import jenisPengaduanDelete from "./del";

const JenisPengaduan = new Elysia({
  prefix: "/jenispengaduan",
  tags: ["Inovasi/Layanan Online Desa/Jenis Pengaduan"],
})
  .get("/find-many", jenisPengaduanFindMany)
  .get("/:id", async (context) => {
    const response = await jenisPengaduanFindUnique(context);
    return response;
  })
  .delete("/del/:id", jenisPengaduanDelete)
  .post("/create", jenisPengaduanCreate, {
    body: t.Object({
      nama: t.String(),
    }),
  })
  .put("/:id", jenisPengaduanUpdate, {
    body: t.Object({
      nama: t.String(),
    }),
  });
export default JenisPengaduan;
