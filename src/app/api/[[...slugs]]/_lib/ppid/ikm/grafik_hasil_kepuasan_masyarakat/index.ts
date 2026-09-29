import Elysia, { t } from "elysia";
import grafikHasilKepuasanMasyarakatCreate from "./create";
import grafikHasilKepuasanMasyarakatFindMany from "./find-many";
import grafikHasilKepuasanMasyarakatFindById from "./find-by-id";
import grafikHasilKepuasanMasyarakatUpdate from "./update";
import grafikHasilKepuasanMasyarakatDelete from "./del";

const GrafikHasilKepuasanMasyarakat = new Elysia({
  prefix: "/grafikhasilkepuasamanmasyarakat",
  tags: ["PPID/IKM/grafikhasilkepuasanmasyarakat"],
})
  .get("/find-many", grafikHasilKepuasanMasyarakatFindMany)
  .get("/:id", async (context) => {
    const response = await grafikHasilKepuasanMasyarakatFindById(context.request)
    return response
  })
  .put("/:id", grafikHasilKepuasanMasyarakatUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      label: t.String(),
      kepuasan: t.String(),
    }),
  })
  .post("/create", grafikHasilKepuasanMasyarakatCreate, {
    body: t.Object({
      label: t.String(),
      kepuasan: t.String(),
    }),
  })
  .delete("/del/:id", grafikHasilKepuasanMasyarakatDelete, {
    params: t.Object({
      id: t.String(),
    }),
  });

export default GrafikHasilKepuasanMasyarakat;
