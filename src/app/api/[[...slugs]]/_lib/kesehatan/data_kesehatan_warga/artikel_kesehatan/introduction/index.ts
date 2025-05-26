import Elysia, { t } from "elysia";
import introductionCreate from "./create";
import introductionFindMany from "./find-many";

const Introduction = new Elysia({
    prefix: "/introduction",
    tags: ["Data Kesehatan/Artikel Kesehatan/Introduction"]
})
    .get("/find-many", introductionFindMany)
    .post("/create", introductionCreate, {
        body: t.Object({
            content: t.String(),
        }),
    })

export default Introduction;