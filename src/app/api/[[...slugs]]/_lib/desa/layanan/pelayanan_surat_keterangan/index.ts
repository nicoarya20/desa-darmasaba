import Elysia from "elysia";
import pelayananSuratKeteranganFindMany from "./find-many";
import pelayananSuratKeteranganFindUnique from "./findUnique";
import pelayananSuratKeteranganCreate from "./create";
import pelayananSuratKeteranganUpdate from "./updt";
import pelayananSuratKeteranganDelete from "./del";
import pelayananSuratKeteranganFindManyAll from "./findManyAll";
import { t } from "elysia";

const PelayananSuratKeterangan = new Elysia({ prefix: "/pelayanansuratketerangan", tags: ["Desa/Layanan/Pelayanan Surat Keterangan"] })
.get("/find-many", pelayananSuratKeteranganFindMany)
.get("/findManyAll", pelayananSuratKeteranganFindManyAll)
.get("/:id", async (context) => {
    const response = await pelayananSuratKeteranganFindUnique(context.request);
    return response;
})
.post("/create", pelayananSuratKeteranganCreate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        image2Id: t.String(),
    }),
})
.delete("/del/:id", pelayananSuratKeteranganDelete)
.put("/:id", async (context) => {
    const response = await pelayananSuratKeteranganUpdate(context);
    return response;
},
{
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        imageId: t.String(),
        image2Id: t.String(),
    }),
})
export default PelayananSuratKeterangan;