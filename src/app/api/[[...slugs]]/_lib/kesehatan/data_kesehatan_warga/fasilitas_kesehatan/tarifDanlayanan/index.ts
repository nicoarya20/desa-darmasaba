import Elysia, { t } from "elysia";
import tarifdanlayananFindMany from "./find-many";
import tarifdanlayananCreate from "./create";
import tarifDanLayananFindUnique from "./findUnique";
import tarifDanLayananUpdate from "./updt";
import tarifDanLayananDelete from "./del";


const TarifDanLayanan = new Elysia({
    prefix: "/tarifdanlayanan",
    tags: ["Data Kesehatan/Fasilitas Kesehatan/Tarif dan Layanan"]
})
.get("/:id", async (context) => {
    const response = await tarifDanLayananFindUnique(new Request(context.request))
    return response
})
.get("/find-many", tarifdanlayananFindMany)
.post("/create", tarifdanlayananCreate, {
    body: t.Object({
        layanan: t.String(),
        tarif: t.String(),
    })
})
.put("/:id", tarifDanLayananUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        layanan: t.String(),
        tarif: t.String(),
    })
})
.delete("/del/:id", tarifDanLayananDelete, {
    params: t.Object({
        id: t.String(),
    })
})
export default TarifDanLayanan;