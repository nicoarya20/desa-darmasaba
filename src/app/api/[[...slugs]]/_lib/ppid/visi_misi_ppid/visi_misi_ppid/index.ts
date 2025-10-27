import Elysia from "elysia";
import visimisiPPIDFindById from "./find-by-id";
import visimisiPPIDUpdate from "./update";
import { t } from "elysia";

const VisiMisiPPID = new Elysia({
    prefix: "/visimisippid",
    tags: ["PPID/Visi Misi PPID"]
})
    .get("/find-by-id", visimisiPPIDFindById)
    .post("/update", visimisiPPIDUpdate, {
        body: t.Object({
            id: t.String(),
            misi: t.String(),
            visi: t.String(),
        })
    })

export default VisiMisiPPID
    