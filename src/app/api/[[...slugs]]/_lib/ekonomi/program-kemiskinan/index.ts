import Elysia, { t } from "elysia";
import programKemiskinanCreate from "./create";
import programKemiskinanDelete from "./del";
import programKemiskinanFindUnique from "./findUnique";
import programKemiskinanUpdate from "./updt";
import programKemiskinanFindMany from "./findMany";

const ProgramKemiskinan = new Elysia({
    prefix: '/programkemiskinan', tags: ['Ekonomi / Program Kemiskinan']
})
.post("/create", programKemiskinanCreate, {
    body: t.Object({
        nama: t.String(),
        deskripsi: t.String(),
        icon: t.String(),
        statistik: t.Object({
            tahun: t.String(),
            jumlah: t.String(),
        }),
    }),
})
.delete("/del/:id", programKemiskinanDelete)
.get("/find-many", programKemiskinanFindMany)
.get("/:id", async (context) => {
    const response = await programKemiskinanFindUnique(context.request);
    return response;
})
.put("/:id", async (context) => {
    const response = await programKemiskinanUpdate(context);
    return response;
}, {
    body: t.Object({
        nama: t.String(),
        deskripsi: t.String(),
        icon: t.String(),
        statistik: t.Object({
            tahun: t.String(),
            jumlah: t.String(),
        }),
    }),
})
export default ProgramKemiskinan;