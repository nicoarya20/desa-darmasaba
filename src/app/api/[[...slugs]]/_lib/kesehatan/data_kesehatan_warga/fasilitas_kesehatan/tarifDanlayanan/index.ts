import Elysia, { t } from "elysia";
import tarifdanlayananFindMany from "./find-many";
import tarifdanlayananCreate from "./create";


const TarifDanLayanan = new Elysia({
    prefix: "/tarifdanlayanan",
    tags: ["Tarif dan Layanan"]
})
.get("/find-many", tarifdanlayananFindMany)
.post("/create", tarifdanlayananCreate, {
    body: t.Object({
        layanan: t.String(),
        tarif: t.String(),
    })
})

export default TarifDanLayanan;