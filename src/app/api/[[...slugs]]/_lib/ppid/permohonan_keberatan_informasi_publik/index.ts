import Elysia, { t } from "elysia";
import permohonanKeberatanInformasiPublikCreate from "./create";
import permohonanKeberatanInformasiPublikFindMany from "./find-many";
import permohonanKeberatanInformasiPublikFindUnique from "./findUnique";
import { guardDataPribadi } from "../../_data-pribadi/guard";

const PermohonanKeberatanInformasiPublik = new Elysia({
    prefix: "/permohonankeberataninformasipublik",
    tags: ["PPID/Permohonan Keberatan Informasi Publik"],
})
    .get("/find-many", permohonanKeberatanInformasiPublikFindMany, { beforeHandle: guardDataPribadi })
    .get("/:id", permohonanKeberatanInformasiPublikFindUnique, { beforeHandle: guardDataPribadi })
    .post("/create", permohonanKeberatanInformasiPublikCreate, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            notelp: t.String(),
            alasan: t.String(),
        }),
    })

export default PermohonanKeberatanInformasiPublik;