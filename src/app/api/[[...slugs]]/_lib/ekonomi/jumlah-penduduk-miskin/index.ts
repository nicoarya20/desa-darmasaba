import Elysia, { t } from "elysia";
import grafikJumlahPendudukMiskinFindMany from "./findMany";
import grafikJumlahPendudukMiskinFindById from "./findUnique";
import grafikJumlahPendudukMiskinUpdate from "./updt";
import grafikJumlahPendudukMiskinCreate from "./create";
import grafikJumlahPendudukMiskinDelete from "./del";

const JumlahPendudukMiskin = new Elysia({
    prefix: "/jumlahpendudukmiskin",
    tags: ["Ekonomi/Jumlah Penduduk Miskin"],
})
    .get("/find-many", grafikJumlahPendudukMiskinFindMany)
    .get("/:id", async (context) => {
        const response = await grafikJumlahPendudukMiskinFindById(new Request(context.request))
        return response
    })
    .put("/:id", grafikJumlahPendudukMiskinUpdate, {
        params: t.Object({
            id: t.String(),
        }),
        body: t.Object({
            year: t.Number(),
            totalPoorPopulation: t.Number(),
        }),
    })
    .post("/create", grafikJumlahPendudukMiskinCreate, {
        body: t.Object({
            year: t.Number(),
            totalPoorPopulation: t.Number(),
        }),
    })
    .delete("/del/:id", grafikJumlahPendudukMiskinDelete, {
        params: t.Object({
            id: t.String(),
        }),
    });

export default JumlahPendudukMiskin;