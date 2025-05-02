import Elysia, { t } from "elysia"
import preventionCreate from "./create"
import preventionFindMany from "./find-many"

const Prevention = new Elysia({
    prefix: "/prevention",
    tags: ["Data Kesehatan/Artikel Kesehatan/Prevention"]
})
    .get("/find-many", preventionFindMany)
    .post("/create", preventionCreate, {
        body: t.Object({
            title: t.String(),
            content: t.String(),
        }),
    })
export default Prevention
