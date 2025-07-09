import Elysia, { t } from "elysia";
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
  .get("/:id", async (context) => {
    const response = await detailDataPengangguranFindUnique(
      new Request(context.request)
    );
    return response;
  })
  .get("/find-many", detailDataPengangguranFindMany)
  .post("/create", detailDataPengangguranCreate, {
    body: t.Object({
      month: t.String(),
      year: t.Number(),
      totalUnemployment: t.Number(),
      educatedUnemployment: t.Number(),
      uneducatedUnemployment: t.Number(),
      percentageChange: t.Number(),
    }),
  })
  .put("/:id", detailDataPengangguranUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      month: t.String(),
      year: t.Number(),
      totalUnemployment: t.Number(),
      educatedUnemployment: t.Number(),
      uneducatedUnemployment: t.Number(),
      percentageChange: t.Number(),
    }),
  })
  .delete("/del/:id", detailDataPengangguranDelete, {
    params: t.Object({
      id: t.String(),
    }),
  })
  .get("/month/:month/year/:year", findByMonthYear, {
    params: t.Object({
      month: t.String(),
      year: t.String(),
    }),
  })

export default DetailDataPengangguran;
