import Elysia, { t } from "elysia"
import firstAidCreate from "./create"
import firstAidFindMany from "./find-many"

const FirstAid = new Elysia({
    prefix: "/firstaid",
    tags: ["Data Kesehatan/Artikel Kesehatan/First Aid"]
})
    .get("/find-many", firstAidFindMany)
    .post("/create", firstAidCreate, {
        body: t.Object({
            title: t.String(),
            content: t.String(),
        }),
    })
export default FirstAid
