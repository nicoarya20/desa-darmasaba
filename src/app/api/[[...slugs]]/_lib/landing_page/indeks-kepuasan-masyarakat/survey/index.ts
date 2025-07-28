import Elysia, { t } from "elysia";
import surveyCreate from "./create";
import surveyUpdate from "./updt";
import surveyFindMany from "./findMany";
import surveyFindUnique from "./findUnique";
import surveyDelete from "./del";

const survey = new Elysia({
  prefix: "/survey",
  tags: ["Landing Page/Indeks Kepuasan Masyarakat/Survey "],
})
  .post("/create", surveyCreate, {
    body: t.Object({
      title: t.String(),
      totalRespondents: t.Number(),
      averageScore: t.Number(),
    }),
  })
  .get("/findMany", surveyFindMany)
  .get("/:id", surveyFindUnique)
  .put("/:id", surveyUpdate, {
    body: t.Object({
      title: t.String(),
      totalRespondents: t.Number(),
      averageScore: t.Number(),
    }),
  })
  .delete("/del/:id", surveyDelete);

export default survey;
