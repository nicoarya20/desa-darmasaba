import Elysia, { t } from "elysia";
import strukturPPIDFindById from "./find-by-id";
import strukturPPIDUpdate from "./update";
import Pegawai from "./pegawai";
import PosisiOrganisasi from "./posisi-organisasi";

const StrukturPPID = new Elysia({
    prefix: "/strukturppid",
    tags: ["PPID/Struktur PPID"]
})
.get("/:id", async (context) => {
    const response = await strukturPPIDFindById(context.request)
    return response
})
.use(Pegawai)
.use(PosisiOrganisasi)
.put("/:id", async (context) => {
    const response = await strukturPPIDUpdate(context)
    return response
}, {
    body: t.Object({
        name: t.String(),
        imageId: t.String(),
    })
})

export default StrukturPPID
