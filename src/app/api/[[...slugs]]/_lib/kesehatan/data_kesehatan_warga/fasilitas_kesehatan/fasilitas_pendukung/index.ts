import Elysia, { t } from "elysia";
import FasilitasPendukungCreate from "./create";
import fasilitasPendukungFindMany from "./find-many";
import fasilitasPendukungFindUnique from "./findUnique";
import fasilitasPendukungUpdate from "./updt";

const FasilitasPendukung = new Elysia({
  prefix: "/fasilitaspendukung",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Fasilitas Pendukung"],
})
  .get("/:id", async (context) => {
    const response = await fasilitasPendukungFindUnique(new Request(context.request))
    return response
  })
  .get("/find-many", fasilitasPendukungFindMany)
  .post("/create", FasilitasPendukungCreate, {
    body: t.Object({
      content: t.String(),
    }),
  })
  .put(":/id", fasilitasPendukungUpdate, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      content: t.String(),
    }),
  })
  .delete("/del/:id", FasilitasPendukungCreate, {
    params: t.Object({
      id: t.String(),
    }),
  })

export default FasilitasPendukung;
