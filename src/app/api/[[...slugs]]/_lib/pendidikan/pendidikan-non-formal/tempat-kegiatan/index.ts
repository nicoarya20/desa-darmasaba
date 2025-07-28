import Elysia, { t } from "elysia";
import tempatKegiatanFindUnique from "./findUnique";
import tempatKegiatanUpdate from "./updt";

const TempatKegiatan = new Elysia({
    prefix: "/tempatkegiatan",
    tags: ["Pendidikan/Pendidikan Non Formal/Tempat Kegiatan"]
})
    .get("/find-by-id", tempatKegiatanFindUnique)
    .post("/update", tempatKegiatanUpdate, {
        body: t.Object({
            id: t.String(),
            judul: t.String(),
            deskripsi: t.String(),
        })
    })

export default TempatKegiatan