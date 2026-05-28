import Elysia, { t } from "elysia";
import posyanduCreate from "./create";
import posyanduDelete from "./del";
import findPosyanduById from "./find-by-id";
import posyanduUpdate from "./updt";
import posyanduFindMany from "./find-many";

const Posyandu = new Elysia({
    prefix: "/posyandu",
    tags: ["Kesehatan/Posyandu"]
})
.post("/create", posyanduCreate, {
    body: t.Object({
        name: t.String(),
        nomor: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        jadwalPelayanan: t.String(),
        banjarId: t.Optional(t.String()),
    })
})
.get("/find-many", posyanduFindMany)
.delete("/del/:id", posyanduDelete)
.get("/:id", async (context) => {
    const response = await findPosyanduById(new Request(context.request));
    return response;
})
.put(
    "/:id",
    async (context) => {
        const response = await posyanduUpdate(context);
        return response;
    },
    {
        body: t.Object({
            name: t.String(),
            nomor: t.String(),
            deskripsi: t.String(),
            imageId: t.String(),
            jadwalPelayanan: t.String(),
            banjarId: t.Optional(t.String()),
        })
    }
)

export default Posyandu;
