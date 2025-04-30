import Elysia, { t } from "elysia";
import LayananTersediaFindMany from "./find-many";
import LayananTersediaCreate from "./create";

const LayananTersedia = new Elysia({
    prefix: "/layanantersedia",
    tags: ["Data Kesehatan/Jadwal Kegiatan/Layanan Tersedia"]
})

.get("/find-many", LayananTersediaFindMany)
.post("/create", LayananTersediaCreate, {
    body: t.Object({
        content: t.String()
    })
})

export default LayananTersedia