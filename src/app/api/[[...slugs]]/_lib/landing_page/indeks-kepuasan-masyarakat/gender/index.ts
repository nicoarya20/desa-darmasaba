import Elysia, { t } from "elysia";
import genderStatCreate from "./create";
import genderStatDelete from "./del";
import genderStatFindMany from "./findMany";
import genderStatFindUnique from "./findUnique";
import genderStatUpdate from "./updt";


const gender = new Elysia({
  prefix: "/gender",
  tags: ["Landing Page/Indeks Kepuasan Masyarakat/Gender"],
})
  .post("/create", genderStatCreate, {
    body: t.Object({
      monthlyStatId: t.String(),
      laki: t.Number(),
      perempuan: t.Number(),
      total: t.Number(),
      percentLaki: t.Number(),
      percentPerempuan: t.Number(),
    }),
  })
  .get("/findMany", genderStatFindMany)
  .get("/:id", genderStatFindUnique)
  .put("/:id", genderStatUpdate, {
    body: t.Object({
      laki: t.Number(),
      perempuan: t.Number(),
      monthlyStatId: t.String(),
      total: t.Number(),
      percentLaki: t.Number(),
      percentPerempuan: t.Number(),
    }),
  })
  .delete("/del/:id", genderStatDelete);

export default gender;
