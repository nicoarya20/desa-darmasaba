import Elysia from "elysia";
import JenisLayanan from "./jenis-layanan";
import administrasiOnlineFindMany from "./findMany";
import administrasiOnlineFindUnique from "./findUnique";
import administrasiOnlineDelete from "./del";
import administrasiOnlineCreate from "./create";
import { t } from "elysia";

const AdministrasiOnline = new Elysia({
  prefix: "/administrasionline",
  tags: ["Inovasi/Layanan Online Desa/Administrasi Online"],
})
  .get("/find-many", administrasiOnlineFindMany)
  .get("/:id", administrasiOnlineFindUnique)
  .delete("/del/:id", administrasiOnlineDelete)
  .post("/create", administrasiOnlineCreate, {
    body: t.Object({
      name: t.String(),
      alamat: t.String(),
      nomorTelepon: t.String(),
      jenisLayananId: t.String(),
    }),
  })
  .use(JenisLayanan);

export default AdministrasiOnline;
