import Elysia, { t } from "elysia";
import lowonganKerjaCreate from "./create";
import lowonganKerjaFindMany from "./findMany";
import lowonganKerjaFindUnique from "./findUnique";
import lowonganKerjaDelete from "./del";
import lowonganKerjaUpdate from "./updt";

const LowonganKerja = new Elysia({prefix: "/lowongankerja", tags: ["Ekonomi/Lowongan Kerja"]})
.post("/create", lowonganKerjaCreate, {
    body: t.Object({
        posisi: t.String(),
        namaPerusahaan: t.String(),
        lokasi: t.String(),
        tipePekerjaan: t.String(),
        gaji: t.String(),
        deskripsi: t.String(),
        kualifikasi: t.String(),
        notelp: t.String(),
    })
})
.get("/find-many", lowonganKerjaFindMany)
.get("/:id", async (context) => {
    const response = await lowonganKerjaFindUnique(new Request(context.request));
    return response;
})
.delete("/del/:id", lowonganKerjaDelete)
.put("/:id", async (context) => {
    const response = await lowonganKerjaUpdate(context);
    return response;
}, {
    body: t.Object({
        posisi: t.String(),
        namaPerusahaan: t.String(),
        lokasi: t.String(),
        tipePekerjaan: t.String(),
        gaji: t.String(),
        deskripsi: t.String(),
        kualifikasi: t.String(),
        notelp: t.String(),
    })
})


export default LowonganKerja;