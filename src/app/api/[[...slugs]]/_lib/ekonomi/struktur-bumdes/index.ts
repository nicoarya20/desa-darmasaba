import Elysia, { t } from "elysia";
import PosisiOrganisasi from "./posisi-organisasi";
import Pegawai from "./pegawai";
import strukturBumDesFindById from "./find-by-id";
import strukturBumDesUpdate from "./update";


const StrukturOrganisasi = new Elysia({
    prefix: "/struktur-organisasi",
    tags: ["Ekonomi/Struktur Organisasi"],
})
.get("/:id", async (context) => {
    const response = await strukturBumDesFindById(context.request)
    return response
})
.use(PosisiOrganisasi)
.use(Pegawai)
.put("/:id", async (context) => {
    const response = await strukturBumDesUpdate(context)
    return response
}, {
    body: t.Object({
        name: t.String(),
        imageId: t.String(),
    })
})


export default StrukturOrganisasi;