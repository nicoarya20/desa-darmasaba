import Elysia, { t } from "elysia";
import fasilitasYangDisediakanFindUnique from "./findUnique";
import fasilitasYangDisediakanUpdate from "./updt";

const FasilitasYangDisediakan = new Elysia({
    prefix: "/fasilitasyangdisediakan",
    tags: ["Pendidikan/Bimbingan Belajar Desa/Fasilitas Yang Disediakan"]
})
    .get("/find-by-id", fasilitasYangDisediakanFindUnique)
    .post("/update", fasilitasYangDisediakanUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default FasilitasYangDisediakan