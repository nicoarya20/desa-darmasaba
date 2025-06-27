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
  .get("/:id", async (context) => {
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
  .put("/:id", persentaseKelahiranKematianUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      tahun: t.String(),
      kematianKasar: t.String(),
      kematianBayi: t.String(),
      kelahiranKasar: t.String(),
    }),
  })
  .delete("/del/:id", persentaseKelahiranKematianDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
export default PersentaseKelahiranKematian;