import Elysia, { t } from "elysia";
import persentaseKelahiranKematianCreate from "./create";
import persentaseKelahiranKematianFindMany from "./find-many";

const PersentaseKelahiranKematian = new Elysia({
  prefix: "/persentasekelahiran",
  tags: ["Data Kesehatan/Persentase Kelahiran Kematian"],
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

export default PersentaseKelahiranKematian;