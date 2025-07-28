import Elysia, { t } from "elysia";
import programUnggulanFindUnique from "./findUnique";
import programUnggulanUpdate from "./updt";

const ProgramUnggulan = new Elysia({
    prefix: "/programunggulan",
    tags: ["Pendidikan/Program Pendidikan Anak/Program Unggulan"]
})
    .get("/find-by-id", programUnggulanFindUnique)
    .post("/update", programUnggulanUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default ProgramUnggulan