import Elysia, { t } from "elysia";
import programKemiskinanCreate from "./create";
import programKemiskinanDelete from "./del";
import programKemiskinanFindUnique from "./findUnique";
import programKemiskinanUpdate from "./updt";
import programKemiskinanFindMany from "./findMany";
import PenerimaProgramKemiskinan from "./penerima";
import ProgramKemiskinanPublik from "./publik";

// Statistik opsional: program bantuan (PKH, CPP, BLT Desa) tidak selalu membawa statistik kemiskinan tahunan.
const bodyProgram = t.Object({
    nama: t.String(),
    deskripsi: t.String(),
    icon: t.String(),
    statistik: t.Optional(t.Object({
        tahun: t.String(),
        jumlah: t.String(),
    })),
});

const ProgramKemiskinan = new Elysia({
    prefix: '/programkemiskinan', tags: ['Ekonomi / Program Kemiskinan']
})
.use(PenerimaProgramKemiskinan)
.use(ProgramKemiskinanPublik)
.post("/create", programKemiskinanCreate, {
    body: bodyProgram,
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
    body: bodyProgram,
})
export default ProgramKemiskinan;