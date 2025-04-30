import Elysia, { t } from "elysia";
import DokumenDiperlukanCreate from "./create";
import DokumenDiperlukanFindMany from "./find-many";

const DokumenDiperlukan = new Elysia({
    prefix: "/dokumendiperlukan",
    tags: ["Data Kesehatan/Jadwal Kegiatan/Dokumen yang diperlukan"]
})

.get("/find-many", DokumenDiperlukanFindMany)
.post("/create", DokumenDiperlukanCreate, {
    body: t.Object({
        content: t.String()
    })
})

export default DokumenDiperlukan