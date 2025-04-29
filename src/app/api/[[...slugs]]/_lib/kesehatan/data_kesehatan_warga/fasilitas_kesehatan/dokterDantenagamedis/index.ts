import Elysia, { t } from "elysia";
import dokterDantenagamedisFindMany from "./find-many";
import dokterDantenagamedisCreate from "./create";

const DokterDantenagamedis = new Elysia({
  prefix: "/dokterdantenagamedis",
  tags: ["Data Kesehatan/Fasilitas Kesehatan/Dokter dan Tenaga Medis"],
})
.get("/find-many", dokterDantenagamedisFindMany)
.post("/create", dokterDantenagamedisCreate, {
    body: t.Object({
        name: t.String(),
        specialist: t.String(),
        jadwal: t.String(),
    })
})

export default DokterDantenagamedis