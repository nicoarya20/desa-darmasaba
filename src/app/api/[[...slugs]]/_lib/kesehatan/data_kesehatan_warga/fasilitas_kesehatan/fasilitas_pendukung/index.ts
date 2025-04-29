import Elysia, { t } from "elysia";
import fasilitasPendukungFindMany from "./find-many";
import FasilitasPendukungCreate from "./create";

const FasilitasPendukung = new Elysia({
  prefix: "/fasilitaspendukung",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Fasilitas Pendukung"],
})
  .get("/find-many", fasilitasPendukungFindMany)
  .post("/create", FasilitasPendukungCreate, {
    body: t.Object({
      content: t.String(),
    }),
  });

export default FasilitasPendukung;
