import Elysia, { t } from "elysia";
import penangananDaruratCreate from "./create";
import penangananDaruratDelete from "./del";
import penangananDaruratFindMany from "./find-many";
import penangananDaruratFindUnique from "./findUnique";
import penangananDaruratUpdate from "./updt";

const PenangananDarurat = new Elysia({
    prefix: "/penanganandarurat",
    tags: ["Kesehatan/Penanganan Darurat"]
})
.post("/create", penangananDaruratCreate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
    })
})
.get("/find-many", penangananDaruratFindMany)
.delete("/del/:id", penangananDaruratDelete)
.get(":id", async (context) => {
    const response = await penangananDaruratFindUnique(new Request(context.request));
    return response;
})
.put(
    ":id",
    async (context) => {
        const response = await penangananDaruratUpdate(context);
        return response;
    },
    {
        body: t.Object({
            name: t.String(),
            deskripsi: t.String(),
            imageId: t.String(),
        })
    }
)
export default PenangananDarurat;