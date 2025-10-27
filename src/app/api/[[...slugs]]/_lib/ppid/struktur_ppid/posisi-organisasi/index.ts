import Elysia, { t } from "elysia";
import posisiOrganisasiFindMany from "./findMany";
import posisiOrganisasiFindUnique from "./findUnique";
import posisiOrganisasiCreate from "./create";
import posisiOrganisasiUpdate from "./updt";
import posisiOrganisasiDelete from "./del";
import posisiOrganisasiFindManyAll from "./findManyAll";

const PosisiOrganisasi = new Elysia({
    prefix: "/posisiorganisasi",
    tags: ["PPID/Struktur PPID/Posisi Organisasi"],
})

.get("/find-many", posisiOrganisasiFindMany)
.get("/find-many-all", posisiOrganisasiFindManyAll)
.get("/:id", async (context) => {
    const response = await posisiOrganisasiFindUnique(context);
    return response;
})
.post("/create", posisiOrganisasiCreate, {
    body: t.Object({
        nama: t.String(),
        deskripsi: t.String(),
        hierarki: t.Number(),
    }),
})
.put("/:id", async (context) => {
    const response = await posisiOrganisasiUpdate(context);
    return response;
}, {
    body: t.Object({
        nama: t.String(),
        deskripsi: t.String(),
        hierarki: t.Number(),
    }),
})
.delete("/del/:id", posisiOrganisasiDelete);

export default PosisiOrganisasi;