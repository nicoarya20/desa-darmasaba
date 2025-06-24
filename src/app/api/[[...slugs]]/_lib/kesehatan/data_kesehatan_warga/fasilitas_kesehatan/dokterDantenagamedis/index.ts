import Elysia, { t } from "elysia";
import dokterDantenagamedisFindMany from "./find-many";
import dokterDantenagamedisCreate from "./create";
import dokterDantenagamedisFindUnique from "./findUnique";
import dokterDantenagamedisUpdate from "./updt";
import dokterDantenagamedisDelete from "./del";

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
.get("/:id", async (context) => {
  const response = await dokterDantenagamedisFindUnique(new Request(context.request))
  return response
})
.put(":/id", dokterDantenagamedisUpdate, {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Object({
        name: t.String(),
        specialist: t.String(),
        jadwal: t.String(),
    })
})
.delete("/del/:id", dokterDantenagamedisDelete, {
    params: t.Object({
        id: t.String(),
    }),
})

export default DokterDantenagamedis