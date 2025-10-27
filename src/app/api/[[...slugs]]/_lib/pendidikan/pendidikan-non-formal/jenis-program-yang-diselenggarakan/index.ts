import Elysia, { t } from "elysia";
import jenisProgramYangDiselenggarakanFindUnique from "./findUnique";
import jenisProgramYangDiselenggarakanUpdate from "./updt";


const JenisProgramYangDiselenggarakan = new Elysia({
    prefix: "/jenisprogramyangdiselenggarakan",
    tags: ["Pendidikan/Pendidikan Non Formal/Jenis Program Yang Diselenggarakan"]
})
    .get("/find-by-id", jenisProgramYangDiselenggarakanFindUnique)
    .post("/update", jenisProgramYangDiselenggarakanUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default JenisProgramYangDiselenggarakan