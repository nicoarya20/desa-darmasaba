import Elysia, { t } from "elysia";
import grafikRespondenCreate from "./create";
import grafikRespondenFindMany from "./find-many";
import grafikRespondenFindById from "./find-by-id";
import grafikRespondenUpdate from "./update";
import grafikRespondenDelete from "./del";

const GrafikBerdasarkanResponden = new Elysia({
    prefix: "/grafikberdasarkanresponden",
    tags: ["PPID/IKM/grafikberdasarkanresponden"]
})
.get("/:id", async (context) => {
    const response = await grafikRespondenFindById(context.request)
    return response
})
.put("/:id", grafikRespondenUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        sangatbaik: t.String(),
        baik: t.String(),
        kurangbaik: t.String(),
        tidakbaik: t.String(),
    }),
})
.get("/find-many", grafikRespondenFindMany)
.post("/create", grafikRespondenCreate, {
    body: t.Object({
        sangatbaik: t.String(),
        baik: t.String(),
        kurangbaik: t.String(),
        tidakbaik: t.String(),
    }),
})
.delete("/del/:id", grafikRespondenDelete, {
    params: t.Object({
        id: t.String(),
    }),
})


export default GrafikBerdasarkanResponden