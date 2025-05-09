import Elysia, { t } from "elysia";
import { misiPPIDFindMany } from "./find-many";
import misiPPIDCreate from "./create";
import { misiPPIDDelete } from "./delete";
import misiPPIDUpdate from "./update";

const MisiPPID = new Elysia({
    prefix: "/misippid",
    tags: ["PPID/Visi Misi PPID/ Misi PPID"],
})
.get("/find-many", misiPPIDFindMany)
.post("/create", misiPPIDCreate, {
    body: t.Object({
        content: t.String(),
    })
})
.put("/update/:id", misiPPIDUpdate, {
    body: t.Object({
        content: t.String(),
    })
})
.delete("/delete/:id", misiPPIDDelete)

export default MisiPPID;