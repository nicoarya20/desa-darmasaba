import Elysia, { t } from "elysia";
import symptomCreate from "./create";
import symptomFindMany from "./find-many";

const Syptom = new Elysia({
    prefix: "/symptom",
    tags: ["Data Kesehatan/Artikel Kesehatan/Syptom"]
})
    .get("/find-many", symptomFindMany)
    .post("/create", symptomCreate, {
        body: t.Object({
            title: t.String(),
            content: t.String(),
        }),
    })
export default Syptom