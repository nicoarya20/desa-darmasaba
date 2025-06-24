import Elysia, { t } from "elysia";
import layananUnggulanCreate from "./create";
import layananUnggulanFindMany from "./find-many";
import layananUnggulanFindUnique from "./findUnique";
import layananUnggulanUpdate from "./updt";
import layananUnggulanDelete from "./del";

const LayananUnggulan = new Elysia({
    prefix: "/layananunggulan",
    tags: ["Data Kesehatan/Fasilitas Kesehatan/Layanan Unggulan"]
})

.get("/:id", async (context) => {
    const response = await layananUnggulanFindUnique(new Request(context.request))
    return response
})
.get("/find-many", layananUnggulanFindMany)
.post("/create", layananUnggulanCreate, {
    body: t.Object({
        content: t.String()
    })
})
.put("/:id", layananUnggulanUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        content: t.String(),
    })
})
.delete("/del/:id", layananUnggulanDelete, {
    params: t.Object({
        id: t.String(),
    })
})

export default LayananUnggulan