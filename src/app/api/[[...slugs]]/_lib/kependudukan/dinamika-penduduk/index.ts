import Elysia, { t } from "elysia";
import { DINAMIKA_TAHUN_MAX, DINAMIKA_TAHUN_MIN } from "@/lib/dinamika-penduduk";
import dinamikaPendudukFindMany from "./findMany";
import dinamikaPendudukFindUnique from "./findUnique";
import dinamikaPendudukCreate from "./create";
import dinamikaPendudukUpdate from "./updt";
import dinamikaPendudukDelete from "./del";

const jumlah = t.Integer({ minimum: 0 });
const body = t.Object({
  tahun: t.Integer({ minimum: DINAMIKA_TAHUN_MIN, maximum: DINAMIKA_TAHUN_MAX }),
  kelahiran: jumlah,
  kematian: jumlah,
  masuk: jumlah,
  keluar: jumlah,
});
const params = t.Object({ id: t.String() });

/** CRUD Dinamika Penduduk: satu baris total per tahun (tahun unik). GET publik, tulis butuh login. */
const DinamikaPenduduk = new Elysia({
  prefix: "/dinamikapenduduk",
  tags: ["Kependudukan/Dinamika Penduduk"],
})
  .get("/find-many", dinamikaPendudukFindMany)
  .get("/:id", dinamikaPendudukFindUnique, { params })
  .post("/create", dinamikaPendudukCreate, { body })
  .put("/:id", dinamikaPendudukUpdate, { params, body })
  .delete("/del/:id", dinamikaPendudukDelete, { params });

export default DinamikaPenduduk;
