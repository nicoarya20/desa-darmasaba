import Elysia, { t } from "elysia";
import programKesehatanCreate from "./create";
import programKesehatanFindMany from "./find-many";
import programKesehatanDelete from "./del";
import programKesehatanFindUnique from "./findUnique";
import programKesehatanUpdate from "./updt";

const ProgramKesehatan = new Elysia({
    prefix: "/programkesehatan",
    tags: ["Kesehatan/Program Kesehatan"],
})
.post("/create", programKesehatanCreate, {
    body: t.Object({
        name: t.String(),
        deskripsiSingkat: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
    })
})
.get("/find-many", programKesehatanFindMany)
.delete("/del/:id", programKesehatanDelete)
.get("/:id", async (context) => {
    const response = await programKesehatanFindUnique(new Request(context.request));
    return response;
})
.put(
    "/:id",
    async (context) => {
        const response = await programKesehatanUpdate(context);
        return response;
    },
    {
        body: t.Object({
            name: t.String(),
            deskripsiSingkat: t.String(),
            deskripsi: t.String(),
            imageId: t.String(),
        })
    }
)
export default ProgramKesehatan;