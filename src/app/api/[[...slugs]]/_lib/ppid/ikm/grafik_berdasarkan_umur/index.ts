import Elysia, { t } from "elysia";
import { grafikBerdasarkanUmurFindMany } from "./find-many";
import { grafikBerdasarkanUmurCreate } from "./create";

const GrafikBerdasarkanUmur = new Elysia({
    prefix: "/grafikberdasarkanumur",
    tags: ["PPID/IKM/grafikberdasarkanumur"]
})
    .get("/find-many", grafikBerdasarkanUmurFindMany)
    .post("/create", grafikBerdasarkanUmurCreate, {
        body: t.Object({
            remaja: t.String(),
            dewasa: t.String(),
            orangtua: t.String(),
            lansia: t.String(),
        }),
    });

export default GrafikBerdasarkanUmur;