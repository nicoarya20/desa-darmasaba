import Elysia, { t } from "elysia";
import detailDataPengangguranFindMany from "./findMany";
import detailDataPengangguranCreate from "./create";
import detailDataPengangguranUpdate from "./updt";
import detailDataPengangguranFindUnique from "./findUnique";
import detailDataPengangguranDelete from "./del";

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
  });

export default DetailDataPengangguran;
