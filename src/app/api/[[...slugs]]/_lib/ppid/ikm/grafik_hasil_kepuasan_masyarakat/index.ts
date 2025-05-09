import Elysia, { t } from "elysia";
import grafikHasilKepuasanMasyarakatCreate from "./create";
import grafikHasilKepuasanMasyarakatFindMany from "./find-many";

const GrafikHasilKepuasanMasyarakat = new Elysia({
  prefix: "/grafikhasilkepuasamanmasyarakat",
  tags: ["PPID/IKM/grafikhasilkepuasanmasyarakat"],
})
  .get("/find-many", grafikHasilKepuasanMasyarakatFindMany)
  .post("/create", grafikHasilKepuasanMasyarakatCreate, {
    body: t.Object({
      label: t.String(),
      kepuasan: t.String(),
    }),
  });

export default GrafikHasilKepuasanMasyarakat;
