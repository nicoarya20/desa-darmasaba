import Elysia, { t } from "elysia";
import SyaratKetentuanFindMany from "./find-many";
import SyaratKetentuanCreate from "./create";

const SyaratKetentuan = new Elysia({
    prefix: "/syaratketentuan",
    tags: ["Data Kesehatan/Jadwal Kegiatan/Syarat dan Ketentuan"]
})
.get("/find-many", SyaratKetentuanFindMany)
.post("/create", SyaratKetentuanCreate, {
    body: t.Object({
        content: t.String()
    })
})

export default SyaratKetentuan
