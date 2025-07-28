import Elysia, { t } from "elysia";
import tujuanProgramFindUnique from "./findUnique";
import tujuanProgramUpdate from "./updt";

const TujuanProgram = new Elysia({
    prefix: "/tujuanprogram",
    tags: ["Pendidikan/Program Pendidikan Anak/Tujuan Program"]
})
    .get("/find-by-id", tujuanProgramFindUnique)
    .post("/update", tujuanProgramUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default TujuanProgram