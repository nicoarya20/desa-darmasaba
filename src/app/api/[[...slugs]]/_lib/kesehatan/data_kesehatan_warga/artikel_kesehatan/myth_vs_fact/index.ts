import Elysia, { t } from "elysia";
import mythVsFactCreate from "./create";
import mythVsFactFindMany from "./find-many";

const MythVsFact = new Elysia({
    prefix: "/mythvsfact",
    tags: ["Data Kesehatan/Artikel Kesehatan/Myth vs Fact"]
})
    .get("/find-many", mythVsFactFindMany)
    .post("/create", mythVsFactCreate, {
        body: t.Object({
            title: t.String(),
            mitos: t.String(),
            fakta: t.String(),
        }),
    })
export default MythVsFact