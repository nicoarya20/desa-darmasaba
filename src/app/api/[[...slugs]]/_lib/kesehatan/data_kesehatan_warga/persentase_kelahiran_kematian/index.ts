import Elysia, { t } from "elysia";
import persentaseKelahiranKematianCreate from "./create";
import persentaseKelahiranKematianFindMany from "./find-many";
import persentaseKelahiranKematianFindUnique from "./findUnique";
import persentaseKelahiranKematianUpdate from "./updt";
import persentaseKelahiranKematianDelete from "./del";

const PersentaseKelahiranKematian = new Elysia({
  prefix: "/persentasekelahiran",
  tags: ["Data Kesehatan/Persentase Kelahiran Kematian"],
})
  .get("/:uuid", async (context) => {
    const response = await persentaseKelahiranKematianFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", persentaseKelahiranKematianFindMany)
  .post("/create", persentaseKelahiranKematianCreate, {
    body: t.Object({
      tahun: t.String(),
      kematianKasar: t.String(),
      kematianBayi: t.String(),
      kelahiranKasar: t.String(),
    }),
  })
  .put("/:uuid", persentaseKelahiranKematianUpdate, {
    params: t.Object({
      uuid: t.String(),
    }),
    body: t.Object({
      tahun: t.String(),
      kematianKasar: t.String(),
      kematianBayi: t.String(),
      kelahiranKasar: t.String(),
    }),
  })
  .delete("/del/:uuid", persentaseKelahiranKematianDelete, {
    params: t.Object({
      uuid: t.String(),
    }),
  })
export default PersentaseKelahiranKematian;