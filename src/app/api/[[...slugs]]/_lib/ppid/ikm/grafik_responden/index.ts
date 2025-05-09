import Elysia, { t } from "elysia";
import grafikRespondenCreate from "./create";
import grafikRespondenFindMany from "./find-many";

const GrafikBerdasarkanResponden = new Elysia({
    prefix: "/grafikberdasarkanresponden",
    tags: ["PPID/IKM/grafikberdasarkanresponden"]
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


export default GrafikBerdasarkanResponden