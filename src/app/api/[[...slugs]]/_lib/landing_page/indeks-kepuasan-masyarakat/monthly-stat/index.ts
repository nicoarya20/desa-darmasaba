import Elysia, { t } from "elysia";
import createMonthlyStat from "./create";
import deleteMonthlyStat from "./del";
import findManyMonthlyStat from "./findMany";
import findUniqueMonthlyStat from "./findUnique";
import updateMonthlyStat from "./updt";


const surveyResponse = new Elysia({
  prefix: "/monthlystat",
  tags: ["Landing Page/Indeks Kepuasan Masyarakat/Survey Response"],
})
  .post("/create", createMonthlyStat, {
    body: t.Object({
      month: t.String(),
      respondentsCount: t.Number(),
      surveyId: t.String(),
    }),
  })
  .get("/findMany", findManyMonthlyStat)
  .get("/:id", findUniqueMonthlyStat)
  .put("/:id", updateMonthlyStat, {
    body: t.Object({
      month: t.String(),
      respondentsCount: t.Number(),
      surveyId: t.String(),
    }),
  })
  .delete("/del/:id", deleteMonthlyStat);

export default surveyResponse;
