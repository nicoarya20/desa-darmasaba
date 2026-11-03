import Elysia, { t } from "elysia";

const monthSchema = t.Union([
  t.Literal("Jan"), t.Literal("Feb"), t.Literal("Mar"), t.Literal("Apr"),
  t.Literal("Mei"), t.Literal("Jun"), t.Literal("Jul"), t.Literal("Agu"),
  t.Literal("Sep"), t.Literal("Okt"), t.Literal("Nov"), t.Literal("Des"),
]);
import detailDataPengangguranCreate from "./create";
import detailDataPengangguranDelete from "./del";
import findByMonthYear from "./findByMonthYear";
import detailDataPengangguranFindMany from "./findMany";
import detailDataPengangguranFindUnique from "./findUnique";
import detailDataPengangguranUpdate from "./updt";

const DetailDataPengangguran = new Elysia({
  prefix: "/detaildatapengangguran",
  tags: ["Ekonomi/Jumlah Pengangguran/Detail Data Pengangguran"],
})
  .get("/find-many", detailDataPengangguranFindMany)
  .get("/month/:month/year/:year", findByMonthYear, {
    params: t.Object({
      month: monthSchema,
      year: t.Number(),
    }),
  })
  .post("/create", detailDataPengangguranCreate, {
    body: t.Object({
      month: monthSchema,
      year: t.Number(),
      totalUnemployment: t.Number(),
      educatedUnemployment: t.Number(),
      uneducatedUnemployment: t.Number(),
      percentageChange: t.Optional(t.Number()),
    }),
  })
  .put("/:id", detailDataPengangguranUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      month: monthSchema,
      year: t.Number(),
      totalUnemployment: t.Number(),
      educatedUnemployment: t.Number(),
      uneducatedUnemployment: t.Number(),
      percentageChange: t.Optional(t.Number()),
    }),
  })
  .delete("/del/:id", detailDataPengangguranDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
  .get("/:id", async (context) => {
    const response = await detailDataPengangguranFindUnique(
      context.request
    );
    return response;
  });

export default DetailDataPengangguran;
