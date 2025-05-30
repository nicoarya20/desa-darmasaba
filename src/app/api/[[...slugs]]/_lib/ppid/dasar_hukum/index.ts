import Elysia, { t } from "elysia";
import dasarHukumPPIDFindById from "./find-by-id";
import dasarHukumPPIDUpdate from "./update";

const DasarHukumPPID = new Elysia({
    prefix: "/dasarhukumppid",
    tags: ["PPID/Dasar Hukum PPID"]
})
    .get("/find-by-id", dasarHukumPPIDFindById)
    .post("/update", dasarHukumPPIDUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            content: t.String(),
        })
    })

export default DasarHukumPPID