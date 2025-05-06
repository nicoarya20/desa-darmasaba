import Elysia, { t } from "elysia";
import grafikBerdasarkanJenisKelaminCreate from "./create";
import grafikBerdasarkanJenisKelaminFindMany from "./find-many";


const GrafikBerdasarkanJenisKelamin = new Elysia({
  prefix: "/grafikberdasarkanjeniskelamin",
  tags: ["PPID/IKM/grafikberdasarkanjeniskelamin"],
})
  .get("/find-many", grafikBerdasarkanJenisKelaminFindMany)
  .post("/create", grafikBerdasarkanJenisKelaminCreate, {
    body: t.Object({
      perempuan: t.String(),
      laki: t.String(),
    }),
  });
export default GrafikBerdasarkanJenisKelamin;
