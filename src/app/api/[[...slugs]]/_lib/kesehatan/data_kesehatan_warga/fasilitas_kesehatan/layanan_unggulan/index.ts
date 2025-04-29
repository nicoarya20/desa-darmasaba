import Elysia, { t } from "elysia";
import layananUnggulanCreate from "./create";
import layananUnggulanFindMany from "./find-many";

const LayananUnggulan = new Elysia({
    prefix: "/layananunggulan",
    tags: ["Data Kesehatan/Fasilitas Kesehatan/Layanan Unggulan"]
})

.get("/find-many", layananUnggulanFindMany)
.post("/create", layananUnggulanCreate, {
    body: t.Object({
        content: t.String()
    })
})

export default LayananUnggulan