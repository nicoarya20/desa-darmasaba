import Elysia, { t } from "elysia";
import tujuanPendidikanNonFormalFindUnique from "./findUnique";
import tujuanPendidikanNonFormalUpdate from "./updt";

const TujuanPendidikanNonFormal = new Elysia({
    prefix: "/tujuanpendidikannonformal",
    tags: ["Pendidikan/Pendidikan Non Formal/Tujuan Pendidikan Non Formal"]
})
    .get("/find-by-id", tujuanPendidikanNonFormalFindUnique)
    .post("/update", tujuanPendidikanNonFormalUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default TujuanPendidikanNonFormal